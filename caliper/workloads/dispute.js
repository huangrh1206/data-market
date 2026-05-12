'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class DisputeWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const id = `${this.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    await this.sutAdapter.sendRequests({
      contractId: 'qdatamarket',
      contractFunction: 'OpenDispute',
      invokerIdentity: 'User1',
      contractArguments: [`d-${id}`, `o-seeded-${this.workerIndex}`, 'HASH_MISMATCH', `eh-${id}`],
      readOnly: false
    });
  }
}

function createWorkloadModule() {
  return new DisputeWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
