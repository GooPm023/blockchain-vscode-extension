/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

import {When, Then} from 'cucumber';
import {CommitHelper} from '../../helpers/CommitHelper';
import {Helper} from '../../helpers/Helper';
import {Collection, DefinedSmartContract} from '../../../src';

When(/^I commit the contract( orgOneOnly)?$/, async function(orgOneOnly: string): Promise<void> {
    let onlyOneOrg: boolean = false;
    if (orgOneOnly) {
        onlyOneOrg = true;
    }
    this.sequence = 1;

    const peerNames: string[] = [Helper.org1Peer];

    if (onlyOneOrg) {
        peerNames.push('peer0.org2.example.com:9051');
    } else {
        peerNames.push(Helper.org2Peer);
    }

    await CommitHelper.commitSmartContract(this.lifecycle, peerNames, this.name, '0.0.1', this.wallet, this.org1Identity);
});

When(/^I commit the contract with sequence '(.*)' and policy '(.*)'$/, async function(sequence: number, policy: string): Promise<void> {
    this.sequence = sequence;
    await CommitHelper.commitSmartContract(this.lifecycle, [Helper.org1Peer, Helper.org2Peer], this.name, '0.0.1', this.wallet, this.org1Identity, policy, sequence);
});

When(/^I commit the contract with collection config and policy '(.*)'$/, async function(policy: string): Promise<void> {
    const collectionConfig: Collection[] = await Helper.getCollectionConfig();
    this.sequence = 1;

    await CommitHelper.commitSmartContract(this.lifecycle, [Helper.org1Peer, Helper.org2Peer], this.name, '0.0.1', this.wallet, this.org1Identity, policy, this.sequence, collectionConfig);
});

Then(/^the smart contract should committed$/, async function(): Promise<void> {
    const result: string[] = await CommitHelper.getCommittedSmartContracts(this.lifecycle, Helper.org1Peer, this.wallet, this.org1Identity);

    result.should.include(this.name);

    const definedContract: DefinedSmartContract = await CommitHelper.getCommittedSmartContract(this.lifecycle, Helper.org1Peer, this.name, this.wallet, this.org1Identity);

    definedContract.smartContractName.should.equal(this.name);
    definedContract.smartContractVersion.should.equal('0.0.1');
    definedContract.sequence.should.equal(parseInt(this.sequence, 10));

    definedContract.approvals!.size.should.equal(2);
    definedContract.approvals!.get('Org1MSP')!.should.equal(true);
    definedContract.approvals!.get('Org2MSP')!.should.equal(true);
});
