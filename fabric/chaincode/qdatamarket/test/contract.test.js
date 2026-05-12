const { test } = require('node:test');
const assert = require('node:assert/strict');
const { QDataMarketContract } = require('../lib/contract');

function mockCtx() {
  const state = new Map();
  return {
    stub: {
      async putState(key, value) {
        state.set(key, value);
      },
      async getState(key) {
        return state.get(key) || Buffer.alloc(0);
      },
      async getStateByRange() {
        const entries = Array.from(state.entries()).map(([key, value]) => ({ key, value }));
        return {
          async *[Symbol.asyncIterator]() {
            for (const entry of entries) {
              yield entry;
            }
          }
        };
      }
    },
    clientIdentity: {
      getID() {
        return 'x509::CN=buyer';
      }
    }
  };
}

test('registers a product and creates an order', async () => {
  const contract = new QDataMarketContract();
  const ctx = mockCtx();
  await contract.RegisterProduct(ctx, 'p1', 'seller1', 'device1', '2026-05-01T00:00:00Z/2026-05-01T01:00:00Z', 'mh', 'dh', 'sh', '100', '95');
  const product = JSON.parse(await contract.ReadProduct(ctx, 'p1'));
  assert.equal(product.status, 'Listed');

  await contract.CreateOrder(ctx, 'o1', 'p1', 'buyer1', '100', '10', '10', '2026-05-02T00:00:00Z');
  const order = JSON.parse(await contract.ReadOrder(ctx, 'o1'));
  assert.equal(order.status, 'Ordered');
});

test('handles access, confirmation, rating, and dispute', async () => {
  const contract = new QDataMarketContract();
  const ctx = mockCtx();
  await contract.RegisterProduct(ctx, 'p2', 'seller1', 'device1', 'range', 'mh', 'dh', 'sh', '100', '90');
  await contract.CreateOrder(ctx, 'o2', 'p2', 'buyer1', '100', '10', '10', '2026-05-02T00:00:00Z');
  await contract.SellerAcceptOrder(ctx, 'o2');
  await contract.IssueAccessToken(ctx, 'o2', 'tokenHash');
  await contract.ConfirmDelivery(ctx, 'o2', 'dh');
  await contract.SubmitRating(ctx, 'o2', '5');
  const settled = JSON.parse(await contract.ReadOrder(ctx, 'o2'));
  assert.equal(settled.status, 'Rated');

  await contract.RegisterProduct(ctx, 'p3', 'seller1', 'device1', 'range', 'mh', 'dh', 'sh', '100', '90');
  await contract.CreateOrder(ctx, 'o3', 'p3', 'buyer1', '100', '10', '10', '2026-05-02T00:00:00Z');
  await contract.OpenDispute(ctx, 'd1', 'o3', 'HASH_MISMATCH', 'evidenceHash');
  await contract.ResolveDispute(ctx, 'd1', 'BUYER_REFUND', '10');
  const disputed = JSON.parse(await contract.ReadOrder(ctx, 'o3'));
  assert.equal(disputed.status, 'Refunded');
});
