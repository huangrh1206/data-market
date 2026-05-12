'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class CreateOrderWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const id = `${this.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    await this.sutAdapter.sendRequests({
      contractId: 'qdatamarket',
      contractFunction: 'CreateOrder',
      invokerIdentity: 'User1',
      contractArguments: [
        `o-${id}`,
        `p-seeded-${this.workerIndex}`,
        `buyer-${this.workerIndex}`,
        '100',
        '10',
        '10',
        '2026-05-02T00:00:00Z'
      ],
      readOnly: false
    });
  }
}

function createWorkloadModule() {
  return new CreateOrderWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
