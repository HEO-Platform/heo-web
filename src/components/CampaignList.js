import React, { Component, lazy } from 'react';
import {Button, Item, Label, Modal, Progress, Header} from 'semantic-ui-react'
import config from 'react-global-configuration';
const CHAIN = process.env.REACT_APP_CHAIN_ID;
const CHAIN_NAME = process.env.REACT_APP_CHAIN_NAME;
var HEOCampaignRegistry, HEOCampaign, web3;

class CampaignList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            campaigns: [],
            showError:false,
            errorMessage:""
        };
    }

    async componentDidMount() {
        this.setState({
            campaigns: (await this.getCampaigns()),
        });
    }

    async getCampaigns() {
        HEOCampaignRegistry = (await import("../remote/"+ CHAIN + "/HEOCampaignRegistry")).default;
        HEOCampaign = (await import("../remote/"+ CHAIN + "/HEOCampaign")).default;
        web3 = (await import("../remote/"+ CHAIN + "/web3")).default;
        try {
            let HEOCampaigns = await HEOCampaignRegistry.methods.allCampaigns().call();
            var campaigns = [];
            for(let i in HEOCampaigns) {
                let campaignAddress = HEOCampaigns[i];
                let campaignInstance = new web3.eth.Contract(HEOCampaign, campaignAddress);
                let isActive = await campaignInstance.methods.isActive().call();
                if(!isActive) {
                    continue;
                }
                let metaDataUrl = await campaignInstance.methods.metaDataUrl().call();
                let metaData = await (await fetch(metaDataUrl)).json();
                let maxAmount = parseInt(web3.utils.fromWei(await campaignInstance.methods.maxAmount().call()));
                let raisedAmount = parseInt(web3.utils.fromWei(await campaignInstance.methods.raisedAmount().call()));
                let coinAddress = await campaignInstance.methods.currency().call();
                let coinName = config.get("chainconfigs")[CHAIN]["currencies"][coinAddress];
                let donationYield = await campaignInstance.methods.donationYield().call();
                let y = web3.utils.fromWei(donationYield.toString());
                let reward = `${y * 100}%`;
                console.log(`Found campaign at ${campaignAddress} for ${maxAmount} of ${coinName}. Raised ${raisedAmount}.
             donationYield = ${donationYield.toString()}, y = ${y}, reward = ${reward}`);
                campaigns.push({
                    address:campaignAddress,
                    description : metaData.description,
                    title: metaData.title,
                    coinName:coinName,
                    maxAmount:maxAmount,
                    raisedAmount:raisedAmount,
                    percentRaised: (raisedAmount > 0 ? (100 * raisedAmount/maxAmount) : 0),
                    mainImage: metaData.mainImageURL,
                    reward: reward
                });
            }
        } catch(err) {
            console.log(err);
            this.setState({
                showError:true,
                errorMessage:"Failed to connect to blockchain network. If you are using a browser wallet like MetaMask, " +
                    "please make sure that it is configured for " + CHAIN_NAME
            })
        }


        return campaigns;
    }

    renderCampaigns() {
        var items = [];
        console.log(this.state.campaigns);
        for(let i in this.state.campaigns) {
            let campaign = this.state.campaigns[i];
            items.push(
                <Item>
                    <Item.Image src={ campaign.mainImage } as='a' href={'/campaign/' + campaign.address} />
                    <Item.Content>
                        <Item.Header as='a'>{campaign.title}</Item.Header>
                        <Item.Description>{campaign.description}</Item.Description>
                    </Item.Content>
                </Item>

            )
            items.push(<Item>
                <Item.Content>
                    <Progress color='olive' percent={campaign.percentRaised}>{campaign.raisedAmount} {campaign.coinName} raised out of {campaign.maxAmount} goal</Progress>
                </Item.Content>
            </Item>)
            items.push(
                <Item>
                    <Item.Content>
                        <Label basic color='green' as='a' href={'/campaign/' + campaign.address}>
                            Accepting: {campaign.coinName}
                        </Label>
                        <Label basic color='red' as='a' href={'/campaign/' + campaign.address}>
                            Rewards: {campaign.reward}
                        </Label>
                        <Label basic color='blue' as='a' href={'/campaign/' + campaign.address}>See more details</Label>
                    </Item.Content>
                </Item>
            )
        };
        return items;
    }

    render() {
        return (
            <div>
                <Item.Group relaxed>
                    {this.renderCampaigns()}
                </Item.Group>
                <Modal open={this.state.showError}>
                    <Header icon='warning sign' content='Failed to connect to network!' />
                    <Modal.Content>{this.state.errorMessage}</Modal.Content>
                    <Modal.Actions>
                        <Button positive onClick={ () => {this.setState({showError:false})}}>
                            OK
                        </Button>
                    </Modal.Actions>
                </Modal>
            </div>

        );
    }
}

export default CampaignList;