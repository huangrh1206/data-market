'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class ConfirmDeliveryWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const id = Math.floor(Math.random() * 1000);
    await this.sutAdapter.sendRequests({
      contractId: 'qdatamarket',
      contractFunction: 'ConfirmDelivery',
      invokerIdentity: 'User1',
      contractArguments: [`o-seeded-${id}`, `dh-seeded-${id}`],
      readOnly: false
    });
  }
}

function createWorkloadModule() {
  return new ConfirmDeliveryWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
