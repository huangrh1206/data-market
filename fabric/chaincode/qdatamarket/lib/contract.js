'use strict';

let Contract;
try {
  ({ Contract } = require('fabric-contract-api'));
} catch {
  Contract = class {};
}

class QDataMarketContract extends Contract {
  async RegisterProduct(ctx, productId, sellerId, deviceId, timeRange, metadataHash, dataHash, storageUriHash, price, qualityScore) {
    const product = {
      productId,
      sellerId,
      deviceId,
      timeRange,
      metadataHash,
      dataHash,
      storageUriHash,
      price: Number(price),
      qualityScore: Number(qualityScore),
      status: 'Listed',
      createdAt: new Date().toISOString()
    };
    await ctx.stub.putState(`PRODUCT_${productId}`, Buffer.from(JSON.stringify(product)));
    return JSON.stringify(product);
  }

  async ReadProduct(ctx, productId) {
    const bytes = await ctx.stub.getState(`PRODUCT_${productId}`);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Product ${productId} not found`);
    }
    return bytes.toString();
  }

  async CreateOrder(ctx, orderId, productId, buyerId, price, buyerDeposit, sellerDeposit, deadline) {
    const product = JSON.parse(await this.ReadProduct(ctx, productId));
    const order = {
      orderId,
      productId,
      buyerId,
      sellerId: product.sellerId,
      price: Number(price),
      buyerDeposit: Number(buyerDeposit),
      sellerDeposit: Number(sellerDeposit),
      accessTokenHash: '',
      status: 'Ordered',
      deadline,
      createdAt: new Date().toISOString()
    };
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify(order);
  }

  async ReadOrder(ctx, orderId) {
    const bytes = await ctx.stub.getState(`ORDER_${orderId}`);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Order ${orderId} not found`);
    }
    return bytes.toString();
  }

  async SellerAcceptOrder(ctx, orderId) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    order.status = 'SellerAccepted';
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify(order);
  }

  async IssueAccessToken(ctx, orderId, accessTokenHash) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    order.accessTokenHash = accessTokenHash;
    order.status = 'AccessIssued';
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify(order);
  }

  async ConfirmDelivery(ctx, orderId, observedDataHash) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    const product = JSON.parse(await this.ReadProduct(ctx, order.productId));
    if (product.dataHash !== observedDataHash) {
      throw new Error('DATA_HASH_MISMATCH');
    }
    order.status = 'Settled';
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify(order);
  }

  async SubmitRating(ctx, orderId, rating) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    const product = JSON.parse(await this.ReadProduct(ctx, order.productId));
    const ratingValue = Number(rating);
    product.qualityScore = Math.max(0, Math.min(100, product.qualityScore * 0.9 + ratingValue * 20 * 0.1));
    order.status = 'Rated';
    await ctx.stub.putState(`PRODUCT_${product.productId}`, Buffer.from(JSON.stringify(product)));
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify({ order, product });
  }

  async OpenDispute(ctx, disputeId, orderId, reason, evidenceHash) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    order.status = 'Disputed';
    const dispute = {
      disputeId,
      orderId,
      reason,
      evidenceHash,
      result: '',
      penalty: 0,
      createdAt: new Date().toISOString()
    };
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    await ctx.stub.putState(`DISPUTE_${disputeId}`, Buffer.from(JSON.stringify(dispute)));
    return JSON.stringify(dispute);
  }

  async ResolveDispute(ctx, disputeId, result, penalty) {
    const bytes = await ctx.stub.getState(`DISPUTE_${disputeId}`);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Dispute ${disputeId} not found`);
    }
    const dispute = JSON.parse(bytes.toString());
    const order = JSON.parse(await this.ReadOrder(ctx, dispute.orderId));
    dispute.result = result;
    dispute.penalty = Number(penalty);
    order.status = result === 'BUYER_REFUND'
      ? 'Refunded'
      : result === 'SELLER_PAID'
        ? 'Settled'
        : 'Penalized';
    await ctx.stub.putState(`DISPUTE_${disputeId}`, Buffer.from(JSON.stringify(dispute)));
    await ctx.stub.putState(`ORDER_${order.orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify({ dispute, order });
  }
}

module.exports = { QDataMarketContract };
