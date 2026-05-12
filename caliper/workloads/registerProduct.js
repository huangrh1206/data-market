'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class RegisterProductWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const id = `${this.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const args = [
      `p-${id}`,
      `seller-${this.workerIndex}`,
      `device-${id}`,
      '2026-05-01T00:00:00Z/2026-05-01T01:00:00Z',
      `mh-${id}`,
      `dh-${id}`,
      `sh-${id}`,
      '100',
      '90'
    ];

    await this.sutAdapter.sendRequests({
      contractId: 'qdatamarket',
      contractFunction: 'RegisterProduct',
      invokerIdentity: 'User1',
      contractArguments: args,
      readOnly: false
    });
  }
}

function createWorkloadModule() {
  return new RegisterProductWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
