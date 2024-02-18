import React from 'react';
import countries from '../countries';
import {Container, Form, Col, Button, DropdownButton, Dropdown, Image, Modal, Row} from 'react-bootstrap';
import ReactPlayer from 'react-player';
import {getCountryCodeForRegionCode} from 'awesome-phonenumber';
import config from "react-global-configuration";
import axios from 'axios';
import { Trans } from 'react-i18next';
import i18n from '../util/i18n';
import { ChevronLeft, CheckCircle, ExclamationTriangle, HourglassSplit, XCircle } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { getEditorStateEn, getEditorStateRu, TextEditorEn, TextEditorRu, setEditorStateEn, setEditorStateRu, editorStateHasChangedRu,
        editorStateHasChangedEn } from '../components/TextEditor';
import { initWeb3, checkAuth, initWeb3Modal, initTronadapter, checkAuthTron, initTron, checkEmail, isValidUrl} from '../util/Utilities';
import '../css/createCampaign.css';
import '../css/modal.css';
import ReactGA from "react-ga4";

var CAMPAIGNINSTANCE;
ReactGA.initialize("G-C657WZY5VT");

class EditCampaign extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showLoader:false,
            loaderMessage:"Please wait",
            showError:false,
            showModal: false,
            modalMessage:"",
            modalIcon:"",
            modalButtonMessage: "",
            modalButtonVariant: "",
            fn:"",
            ln:"",
            orgEn:"",
            orgRu:"",
            ogOrg:{},
            cn:"",
            vl:"",
            titleEn:"",
            titleRu:"",
            ogTitle:{},
            descriptionEn:"",
            descriptionRu:"",
            ogDescription:{},
            ogDescriptionEditor:{},
            mainImageURL: "",
            imgID:"",
            mainImageFile:"",
            waitToClose: false,
            maxAmount:0,
            maxAmount_old:0,
            updateImage: false,
            updateMeta: false,
            campaignId: "",
            currentError:"",
            updatedEditorStateEn: false,
            updatedEditorStateRu: false,
            chains:{},
            accounts:{},
            line_accounts:{},
            addresses: {},
            defDonationAmount: 0,
            fiatPayments: true,
            key: "",
            chainId:"",
            tronChainId:"",
            isInTron:false,
            isInEtherium:false,
            resultEtherium : true,
            resultTron: true,
            active:false,
            email:"",
            countryCode:"",
            number:"",
            website:"",
            telegram:""
        };

    }

   onSubmit = (e) => {
        e.preventDefault();
        console.log("refresh prevented");
    };

    handleTextArea = (e) => {
        this.setState({description:e.target.value, updateMeta : true});
    }

    handleChange = (e) => {
        let help_value;
        const name = e.target.name
        const value = e.target.value;
        const checked = e.target.checked;
        if (name === 'fiatPayments')
        this.setState({fiatPayments: checked});
        else if (name === 'EtheriumCheckbox')
        this.setState({isInEtherium: checked});
        else if (name === 'TronCheckbox')
        this.setState({isInTron: checked});
        else if(e.target.name === 'number'){
            help_value = '';
            for(let i = 0; i < e.target.value.length; i++){
             if ((/^[-0-9]*$/.test(e.target.value[i]) === true)||(e.target.value[i] === ' '))
              help_value += e.target.value[i];
            }
            e.target.value = help_value;
            this.setState({ [e.target.name]: e.target.value });
          }
        else
        this.setState({ [name] : value, updateMeta : true });
    }

    fileSelected = e => {
        this.setState({
            mainImageFile:e.target.files[0],
            mainImageURL: URL.createObjectURL(e.target.files[0]),
            updateImage : true, updateMeta : true
        });
    }

    handleClick = async () => {
        let result;
        if (this.state.maxAmount_old !== this.state.maxAmount){
          if ((window.ethereum)&&(this.state.isInEtherium)){
            await initWeb3Modal(this.state.chainId, this);
            await initWeb3(this.state.chainId, this);
            // is the user logged in?
            if(!this.state.isLoggedIn) {
                await checkAuth(this.state.chainId, this);
            }
          }
          if ((window.tron)&&(this.state.isInTron)){
            await initTronadapter();
            await initTron(this.state.tronChainId, this);
            // is the user logged in?
            if(!this.state.isLoggedInTron) {
                await checkAuthTron(this.state.tronChainId, this);
            }
          }
        }

        this.setState({resultEtherium : true, resultTron: true});
        //check if this campaign belongs to this user
        if(editorStateHasChangedEn()|| editorStateHasChangedRu()) {
            this.state.updateMeta = true;
        }
        if(!this.state.orgEn) {
            this.setState(
                {showModal:true, modalTitle: 'requiredFieldsTitle',
                    modalMessage: 'orgRequiredEn', modalIcon: 'ExclamationTriangle',
                    waitToClose: false,
                    modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                });
            return false;
        }
        if(!this.state.cn) {
            this.setState(
                {showModal:true, modalTitle: 'requiredFieldsTitle',
                    modalMessage: 'cnRequired', modalIcon: 'ExclamationTriangle',
                    waitToClose: false,
                    modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                });
            return false;
        }
        if(this.state.website){
            result =  await isValidUrl(this.state.website);
            if(!result){
             this.setState(
                 {showModal:true, modalTitle: 'requiredFieldsTitle',
                     modalMessage: 'badWebsite', modalIcon: 'ExclamationTriangle',
                     waitToClose: false,
                     modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                 });
                 return false;
            }
         }
        if(!this.state.titleEn) {
            this.setState(
                {showModal:true, modalTitle: 'requiredFieldsTitle',
                    modalMessage: 'titleRequired', modalIcon: 'ExclamationTriangle',
                    waitToClose: false,
                    modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                });
            return false;
        }
        if(!this.state.email) {
            this.setState(
                {showModal:true, modalTitle: 'requiredFieldsTitle',
                    modalMessage: 'emailRequired', modalIcon: 'ExclamationTriangle',
                    waitToClose: false,
                    modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                });
            return false;
        }
        result = await checkEmail(this.state.email);
        if(!result) {
            this.setState(
                {showModal:true, modalTitle: 'requiredFieldsTitle',
                    modalMessage: 'emailFaulty', modalIcon: 'ExclamationTriangle',
                    waitToClose: false,
                    modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                });
            return false;
        }
        if ((this.state.number)&&(this.state.countryCode.trim()==="")){
            this.setState(
                {showModal:true, modalTitle: 'requiredFieldsTitle',
                    modalMessage: 'countryCodeRequired', modalIcon: 'ExclamationTriangle',
                    waitToClose: false,
                    modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                });
            return false;
        }
        if(!this.state.descriptionEn) {
            this.setState(
                {showModal:true, modalTitle: 'requiredFieldsTitle',
                    modalMessage: 'shortDescRequired', modalIcon: 'ExclamationTriangle',
                    waitToClose: false,
                    modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                });
            return false;
        }
        let n = 0;
        let EditorStateEn = await getEditorStateEn();
        if (EditorStateEn){
            for (let i = 0; i < EditorStateEn.blocks.length; i++){
                n = n + EditorStateEn.blocks[i].text.length;
              }
              if (n < 3) {
                  this.setState(
                      {showModal:true, modalTitle: 'requiredFieldsTitle',
                          modalMessage: 'longDescRequired', modalIcon: 'ExclamationTriangle',
                          waitToClose: false,
                          modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                      });
                  return false;
              }
              for (let i = 0; i < EditorStateEn.blocks.length; i++){
                  for(let j = 0; j < EditorStateEn.blocks[i].text.length; j++){
                    if (/^[А-Яа-я]*$/.test(EditorStateEn.blocks[i].text[j]) === true){
                        this.setState(
                          {showModal:true, modalTitle: 'requiredFieldsTitle',
                           modalMessage: 'longDescEnIncludRu', modalIcon: 'ExclamationTriangle',
                           waitToClose: false,
                           modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
                        });
                        return false;
                    }
                  }
              }
        }

        this.setState({showModal:true, modalTitle: 'processingWait',
                modalMessage: 'waitingForNetwork',
                modalIcon:'HourglassSplit',
                modalButtonVariant: "gold", waitToClose: true});
        var newImgUrl = this.state.mainImageURL;
        if(this.state.updateImage) {
            newImgUrl = await this.uploadImageS3('main');
            if(!newImgUrl) {
                this.setState({showModal:true,
                    modalTitle: 'imageUploadFailed',
                    modalMessage: 'technicalDifficulties',
                    modalIcon:'XCircle', modalButtonMessage: 'returnHome',
                    modalButtonVariant: "#E63C36", waitToClose: false});
                return;
            }
        }
        //updating existing HEOCampaign
        if(this.state.updateMeta){
            if(!(await this.updateCampaign())) {
                this.setState({showModal : true,
                    modalTitle: 'updatingAmountFailed',
                    modalMessage: this.state.currentError,
                    modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                    modalButtonVariant: "#E63C36", waitToClose: false});
                return;
            }
        }
        result = await this.updateCampaign();
        if (result === false)
        this.setState({showModal : true,
                modalTitle: 'failed',
                modalMessage: 'errorWritingCampaignToDB',
                modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                modalButtonVariant: "#E63C36", waitToClose: false});
        else this.setState({
            showModal: true, modalTitle: 'complete', goHome: true,
            modalMessage: 'updateSuccessfull',
            modalIcon: 'CheckCircle', modalButtonMessage: 'closeBtn',
            modalButtonVariant: '#588157', waitToClose: false
        });
    }

    async savetoTron(new_record){
      try{
        this.setState({showModal:false});
        if(!window.tronWeb) {
            await initTron(this.state.tronChainId , this);
        }
        await window.tronAdapter.connect();
        let compressed_meta = {};
        if(!new_record){
            let HEOCampaign = (await import("../remote/"+ this.state.tronChainId + "/HEOCampaign")).default;
            CAMPAIGNINSTANCE = await window.tronWeb.contract(HEOCampaign, window.tronWeb.address.fromHex(this.state.addresses[this.state.tronChainId]));
            this.setState({showModal:true,modalTitle: 'processingWait',
                modalMessage: 'updatingCampaignOnBlockchain', modalIcon:'HourglassSplit',
                modalButtonVariant: "gold", waitToClose: true});
            let result =await CAMPAIGNINSTANCE.update(window.tronWeb.toSun(this.state.maxAmount), compressed_meta)
              .send({from:window.tronAdapter._wallet.tronWeb.defaultAddress.hex,callValue:0,feeLimit:15000000000,shouldPollResponse:false});
            let txnObject;
            let m = 1;
            do {
                console.log("Waiting for transaction record");
                txnObject = await window.tronWeb.trx.getTransactionInfo(result);
                if(txnObject){
                   if (txnObject.receipt)  break;
                }
                // wait for 5 seconds
                await new Promise(resolve => setTimeout(resolve, 5000));
            } while(m !== 2);
            if(txnObject.receipt.result !== "SUCCESS") {
                return false;
            } else {
                this.state.line_accounts[this.state.tronChainId]  = window.tronAdapter._wallet.tronWeb.defaultAddress.hex;
                return (true);
            }
        }
        else {
            try {
                this.setState({showModal:true,modalTitle: 'processingWait',
                modalMessage: 'updatingCampaignOnBlockchain', modalIcon:'HourglassSplit',
                modalButtonVariant: "gold", waitToClose: true});
                let abi = (await import("../remote/" + this.state.tronChainId + "/HEOCampaignFactory")).abi;
                let address = (await import("../remote/" + this.state.tronChainId + "/HEOCampaignFactory")).address;
                address = window.tronWeb.address.toHex(address);
                var HEOCampaignFactory = await window.tronWeb.contract(abi, address);
                try {
                    let result = await HEOCampaignFactory.methods.createCampaign(window.tronWeb.toSun(this.state.maxAmount),
                    window.tronAdapter._wallet.tronWeb.defaultAddress.hex, compressed_meta)
                    .send({from:window.tronAdapter._wallet.tronWeb.defaultAddress.hex,callValue:0,feeLimit:15000000000,shouldPollResponse:false});
                    this.setState({showModal:true, modalTitle: 'processingWait',
                        modalMessage: 'waitingForNetwork', modalIcon:'HourglassSplit',
                        modalButtonVariant: "gold", waitToClose: true});
                    let txnObject;
                    let m = 1;
                    do {
                        console.log("Waiting for transaction record");
                        txnObject = await window.tronWeb.trx.getTransactionInfo(result);
                        if(txnObject && txnObject.receipt) {
                            break;
                        }
                    } while(m !== 2);

                    if (txnObject.receipt.result === "SUCCESS") {
                      m = 1;
                      let transEvent;
                      do {
                         console.log("Waiting for event to be recorded per transaction");
                         transEvent = await window.tronWeb.getEventByTransactionID(result);
                         if (transEvent && transEvent.length > 0) {
                             break;
                         }
                      } while(m !== 2);

                      console.log(`createCampaign transaction successful ${transEvent}`);
                      this.state.addresses[this.state.tronChainId] = transEvent[0].result.campaignAddress;
                      this.state.line_accounts[this.state.tronChainId]  = window.tronAdapter._wallet.tronWeb.defaultAddress.hex;
                      this.state.maxAmount_old = this.state.maxAmount;

                      let res =await this.updateCampaign();
                      if (res === false)
                        this.setState({showModal : true,
                          modalTitle: 'failed',
                          modalMessage: 'errorWritingCampaignToDB',
                          modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                          modalButtonVariant: "#E63C36", waitToClose: false
                        });
                      else this.setState({
                        showModal: true, modalTitle: 'complete', goHome: true,
                        modalMessage: 'updateSuccessfull',
                        modalIcon: 'CheckCircle', modalButtonMessage: 'closeBtn',
                        modalButtonVariant: '#588157', waitToClose: false
                      });
                      return (true);
                    } else {
                        this.setState({showModal : true,
                            modalTitle: 'failed',
                            modalMessage: 'blockChainTransactionFailed',
                            modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                            modalButtonVariant: "#E63C36", waitToClose: false
                        });
                      return false;
                    }
                } catch (err) {
                    console.log(err);
                    this.setState({showModal : true,
                        modalTitle: 'failed',
                        modalMessage: 'blockChainTransactionFailed',
                        modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                        modalButtonVariant: "#E63C36", waitToClose: false
                    });
                    return false;
                }
            } catch (error) {
              console.log(error);
              this.setState({showModal : true,
                modalTitle: 'failed',
                modalMessage: 'blockChainTransactionFailed',
                modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                modalButtonVariant: "#E63C36", waitToClose: false
            });
              return false;
            }
        }
      } catch (err) {
            console.log(err);
            this.setState({showModal : true,
                modalTitle: 'failed',
                modalMessage: 'blockChainTransactionFailed',
                modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                modalButtonVariant: "#E63C36", waitToClose: false
            });
            return (false)
      }
    }

    async saveToEtherium(new_record){
        try{
            this.setState({showModal:false});
            if(!this.state.accounts || !this.state.web3) {
             await initWeb3(this.state.chainId, this);
            }
            let compressed_meta = {};
            if (!new_record){
                this.setState({showModal:true, modalTitle: 'processingWait',
                modalMessage: 'waitingForNetwork', modalIcon: 'HourglassSplit',
                modalButtonVariant: "gold", waitToClose: true});
                console.log(`Campaign already deployed on ${this.state.chainId} - updating`);
                let HEOCampaign = (await import("../remote/"+ this.state.chainId + "/HEOCampaign")).default;
                CAMPAIGNINSTANCE = new this.state.web3.eth.Contract(HEOCampaign, this.state.addresses[this.state.chainId]);
                await CAMPAIGNINSTANCE.methods.update(
                    this.state.web3.utils.toWei(`${this.state.maxAmount}`), compressed_meta).send({from:this.state.accounts[0]});
                this.state.line_accounts[this.state.chainId]  = this.state.accounts[0];
                this.setState(
                    {showModal:true, modalTitle: 'processingWait',
                    modalMessage: 'waitingForOperation', modalIcon: 'HourglassSplit',
                    modalButtonVariant: "gold", waitToClose: true
                    });
                return (true);
            }
            else{
                this.setState({showModal:true, modalTitle: 'processingWait',
                modalMessage: 'waitingForNetwork', modalIcon: 'HourglassSplit',
                modalButtonVariant: "gold", waitToClose: true});
                let abi = (await import("../remote/" + this.state.chainId + "/HEOCampaignFactory")).abi;
                let address = (await import("../remote/" + this.state.chainId + "/HEOCampaignFactory")).address;
                var HEOCampaignFactory = new this.state.web3.eth.Contract(abi, address);
                var that = this;
                var web3 = this.state.web3;
                var result;
                if(window.web3Modal.cachedProvider === "binancechainwallet") {
                    HEOCampaignFactory.methods.createCampaign(
                        this.state.web3.utils.toWei(`${this.state.maxAmount}`), this.state.accounts[0], compressed_meta)
                        .send({from:this.state.accounts[0]})
                        .once('transactionHash', function(transactionHash) {
                            that.setState({showModal:true, modalTitle: 'processingWait',
                                modalMessage: 'waitingForNetwork', modalIcon: 'HourglassSplit',
                                modalButtonVariant: "gold", waitToClose: true}
                            );
                            web3.eth.getTransaction(transactionHash).then(
                             function(txnObject) {
                                  result =  checkTransaction(txnObject, that);
                                  that.setState(
                                    {showModal:true, modalTitle: 'processingWait',
                                    modalMessage: 'waitingForOperation', modalIcon: 'HourglassSplit',
                                    modalButtonVariant: "gold", waitToClose: true
                                    });
                                  return (result);
                                }
                            );
                        });
                } else {
                    result = await HEOCampaignFactory.methods.createCampaign(
                            this.state.web3.utils.toWei(`${this.state.maxAmount}`), this.state.accounts[0], compressed_meta)
                            .send({from:this.state.accounts[0]})
                            .on('transactionHash',
                                function(transactionHash) {
                                    that.setState({showModal:true, modalTitle: 'processingWait',
                                        modalMessage: 'waitingForNetwork', modalIcon: 'HourglassSplit',
                                        modalButtonVariant: "gold", waitToClose: true});
                                });
                    if(result && result.events && result.events.CampaignDeployed && result.events.CampaignDeployed.address) {
                        console.log(`Deployed campaign to ${this.state.chainId} at ${result.events.CampaignDeployed.returnValues.campaignAddress}`)
                        this.state.addresses[this.state.chainId] = result.events.CampaignDeployed.returnValues.campaignAddress;
                        this.state.line_accounts[this.state.chainId]  = this.state.accounts[0];
                        this.state.maxAmount_old = this.state.maxAmount;
                        let res =await this.updateCampaign();
                        if (res === false)
                          this.setState({showModal : true,
                            modalTitle: 'failed',
                            modalMessage: 'errorWritingCampaignToDB',
                            modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                            modalButtonVariant: "#E63C36", waitToClose: false
                        });
                        else this.setState({
                          showModal: true, modalTitle: 'complete', goHome: true,
                          modalMessage: 'updateSuccessfull',
                          modalIcon: 'CheckCircle', modalButtonMessage: 'closeBtn',
                          modalButtonVariant: '#588157', waitToClose: false
                        });
                      return (true);
                    } else {
                        this.setState({showModal : true,
                            modalTitle: 'failed',
                            modalMessage: 'blockChainTransactionFailed',
                            modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                            modalButtonVariant: "#E63C36", waitToClose: false
                        });
                        return false;
                    }
                }
            }
        } catch (err) {
            console.log(err);
            this.setState({showModal : true,
                modalTitle: 'failed',
                modalMessage: 'blockChainTransactionFailed',
                modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                modalButtonVariant: "#E63C36", waitToClose: false
            });
            return (false)
        }
    }

    async updateCampaign() {

        try {
            let data = {
                mainImageURL: this.state.mainImageURL,
                fn: this.state.fn,
                ln: this.state.ln,
                cn: this.state.cn,
                vl: this.state.vl,
                defaultDonationAmount: this.state.defDonationAmount,
                fiatPayments: this.state.fiatPayments,
            };
            data.key = this.state.key;
            data.description = this.state.ogDescription;
            data.description["en"] = this.state.descriptionEn;
            data.description["ru"] = this.state.descriptionRu;
            data.description["default"] = this.state.descriptionEn;
            data.title = this.state.ogTitle;
            data.title["en"] = this.state.titleEn;
            data.title["ru"] = this.state.titleRu;
            data.title["default"] = this.state.titleEn;
            data.descriptionEditor = this.state.ogDescriptionEditor;
            data.email = this.state.email;
            data.countryCode = this.state.countryCode;
            data.number = this.state.number;
            data.telegram = this.state.telegram;
            data.website = this.state.website;
            if (editorStateHasChangedEn()){
              let EditorStateEn = await getEditorStateEn();
              data.descriptionEditor["en"] = EditorStateEn;
              data.descriptionEditor["default"] = EditorStateEn;
            }
            if (editorStateHasChangedRu()){
                let EditorStateRu = await getEditorStateRu();
                data.descriptionEditor["ru"] = EditorStateRu;
            }
            data.maxAmount = this.state.maxAmount;
            data.org = this.state.ogOrg;
            data.org["en"] = this.state.orgEn;
            data.org["default"] = this.state.orgEn;
            data.org["ru"] = this.state.orgRu;
            data.addresses = this.state.addresses;
            data.accounts = this.state.line_accounts;
            console.log(`Updating title to`);
            console.log(data.title);
            console.log(`Updating org to`);
            console.log(data.org);
            let result;

            let dataForDB = {address: this.state.campaignId, dataToUpdate: data};
            try {
               let res = await axios.post('/api/campaign/update', {mydata : dataForDB},
                 {headers: {"Content-Type": "application/json"}});
                 if (res.data !== 'success') return (false);
            } catch (err) {
               console.log(err);
               if(err.response) {
                   this.setState({currentError : 'technicalDifficulties'});
               } else if (err.request) {
                   this.setState({currentError : 'checkYourConnection'});
               } else {
                   this.setState({currentError : ''});
               }
               return false;
            }
            if(this.state.maxAmount_old !== this.state.maxAmount){
              if(this.state.addresses[this.state.chainId]){
                result = await this.saveToEtherium(false);
                if (result !== true) this.setState({resultEtherium : false});
                this.setState({showModal:true,modalTitle: 'processingWait',
                  modalMessage: 'waitingForOperation', modalIcon:'HourglassSplit',
                  modalButtonVariant: "gold", waitToClose: true});
              }
              if(this.state.addresses[this.state.tronChainId]){
                result = await this.savetoTron(false);
                if (result !== true) this.setState({resultTron : false});
                this.setState({showModal:true,modalTitle: 'processingWait',
                  modalMessage: 'waitingForOperation', modalIcon:'HourglassSplit',
                  modalButtonVariant: "gold", waitToClose: true});
              }
            }
            return true;

        }catch(err){
            console.log(err);
            return (false);
        }
    }

    async uploadImageS3(type) {
        this.setState({showModal:true, modalTitle: 'processingWait',
        modalMessage: 'uploadingImageWait', modalIcon:'HourglassSplit',
        modalButtonVariant: "gold", waitToClose: true});
        let imgID = this.state.imgID;
        const formData = new FormData();
        if(type === 'main') {
            this.setState({ imageFileName : imgID,});
            let fileType = this.state.mainImageFile.type.split("/")[1];
            formData.append(
                "myFile",
                this.state.mainImageFile,
                `${imgID}.${fileType}`,
            );
        }
        try {
            let res = await axios.post('/api/uploadimage', formData);
            if(type === 'main') {
                this.setState({showModal: false, mainImageURL: res.data});
            }
            return res.data;
        } catch (err) {
            if(err.response) {
                this.setState({currentError : 'technicalDifficulties'});
            } else if (err.request) {
                this.setState({currentError : 'checkYourConnection'});
            } else {
                this.setState({currentError : ''});
            }
            return false;
        }
    }

    render() {
        return (
            <div>
                <Modal show={this.state.showModal} onHide={()=>{}} className='myModal' centered>
                    <Modal.Body><p className='modalIcon'>
                        {this.state.modalIcon === 'CheckCircle' && <CheckCircle style={{color:'#588157'}} />}
                        {this.state.modalIcon === 'ExclamationTriangle' && <ExclamationTriangle/>}
                        {this.state.modalIcon === 'HourglassSplit' && <HourglassSplit style={{color: 'gold'}}/>}
                        {this.state.modalIcon === 'XCircle' && <XCircle style={{color: '#E63C36'}}/>}
                        </p>
                        <p className='modalTitle'><Trans i18nKey={this.state.modalTitle}/></p>
                        <p className='modalMessage'><Trans i18nKey={this.state.modalMessage}/></p>
                        {!this.state.waitToClose &&
                        <Button className='myModalButton'
                            style={{backgroundColor : this.state.modalButtonVariant, borderColor : this.state.modalButtonVariant}}
                            onClick={ () => {
                                if (this.state.resultEtherium === false){
                                 this.setState({showModal : true,
                                    modalTitle: 'failed',
                                    modalMessage: 'updatingAmountFailedEtherium',
                                    modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                                    modalButtonVariant: "#E63C36", waitToClose: false, resultEtherium:true});
                                }
                                else if (this.state.resultTron === false){
                                    this.setState({showModal : true,
                                       modalTitle: 'failed',
                                       modalMessage: 'updatingAmountFailedTron',
                                       modalIcon:'XCircle', modalButtonMessage: 'closeBtn',
                                       modalButtonVariant: "#E63C36", waitToClose: false, resultTron:true});
                                   }
                                else this.setState({showModal:false});
                            }}>
                            <Trans i18nKey={this.state.modalButtonMessage} />
                        </Button>
                        }
                    </Modal.Body>
                </Modal>
                <Container className='backToCampaignsDiv'>
                    <Link className={"backToCampaignsLink"} to="/myCampaigns"><span><ChevronLeft id='backToCampaignsChevron'/><Trans i18nKey='backToMyCampaigns'/></span></Link>
                </Container>
                <Container id='mainContainer'>
                    <Form onSubmit={this.onSubmit}>
                        <div className='titles'> <Trans i18nKey='aboutYou'/> </div>
                        <Form.Group >
                            <Form.Label><Trans i18nKey='organization'/><span className='redAsterisk'>*</span></Form.Label>
                            <Row>
                            <Col>
                            <Form.Label><Trans i18nKey='english'/><span className='redAsterisk'>*</span></Form.Label>
                            </Col>
                            <Col>
                            <Form.Label><Trans i18nKey='russian'/><span className='redAsterisk'></span></Form.Label>
                            </Col>
                            </Row>
                            <Row>
                            <Col>
                            <Form.Control required type="text" className="createFormPlaceHolder" placeholder={i18n.t('on')}
                                name='orgEn' value={this.state.orgEn} onChange={this.handleChange}/>
                            </Col>
                            <Col>
                            <Form.Control required type="text" className="createFormPlaceHolder" placeholder={i18n.t('on')}
                                name='orgRu' value={this.state.orgRu} onChange={this.handleChange}/>
                            </Col>
                            </Row>
                        </Form.Group>
                        <Form.Group as={Col}>
                                <Form.Label><Trans i18nKey='selectConuntry'/><span className='redAsterisk'>*</span></Form.Label>
                                <Form.Control required as="select" name='cn' value={this.state.cn} onChange={this.handleChange} >
                                {countries.map( (data)=>
                                    <option value={data.value}>{data.text}</option>
                                )}
                                </Form.Control>
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>{i18n.t('website')}</Form.Label>
                          <Form.Control required type="text" className="createFormPlaceHolder" value={this.state.website}
                            placeholder={i18n.t('website')} name='website' onChange={this.handleChange}/>
                        </Form.Group>
                        <div className='titles'> <Trans i18nKey='campaignDetails'/></div>
                        <Form.Group>
                            <Form.Label>{i18n.t('howMuchYouNeed')}<span className='redAsterisk'>*</span></Form.Label>
                            <Form.Control required type="number" className="createFormPlaceHolder"
                                          value={this.state.maxAmount} placeholder={this.state.maxAmount}
                                          name='maxAmount' onChange={this.handleChange}/>
                            <Form.Label><Trans i18nKey='defDonationAmount'/><span
                                className='redAsterisk'></span></Form.Label>
                            <Form.Control required type="number" className="createFormPlaceHolder"
                                          value={this.state.defDonationAmount} placeholder={this.state.defDonationAmount}
                                          name='defDonationAmount' onChange={this.handleChange} onwheel="this.blur()" />
                            <Row>
                            <Col xs="auto">
                            <Form.Label><Trans i18nKey='fiatPayments'/><span
                                className='redAsterisk'></span></Form.Label>
                            </Col>
                            <Col xs lg="1">
                            <Form.Check type="checkbox" checked={this.state.fiatPayments}
                                        value={this.state.fiatPayments} placeholder={this.state.fiatPayments}
                                        name='fiatPayments' onChange={this.handleChange} onwheel="this.blur()"/>
                            </Col>
                            </Row>
                        </Form.Group>
                        <hr/>
                        <Form.Group>
                            <Form.Label><Trans i18nKey='selectCoverImage'/><span className='redAsterisk'>*</span></Form.Label>
                            <Form.Label><span className='optional'>(<Trans i18nKey='coverImageHint'/>)</span></Form.Label>
                            <Form.File
                                name='imageFile' className="position-relative"
                                id="campaignImgInput" accept='.jpg,.png,.jpeg,.gif'
                                onChange={this.fileSelected}
                            />
                        </Form.Group>
                        <Image id='createCampaignImg' src={this.state.mainImageURL}/>
                        <Form.Group>
                            <Form.Label><Trans i18nKey='promoVideo'/> <span className='optional'>(<Trans i18nKey='optional'/>)</span></Form.Label>
                            <Form.Control type="text" className="createFormPlaceHolder" placeholder={i18n.t('linkToYouTube')}
                                name='vl' value={this.state.vl} onChange={this.handleChange}/>
                        </Form.Group>
                        { this.state.vl !== "" && <ReactPlayer url={this.state.vl} id='createCampaignVideoPlayer' />}
                        <Form.Group>
                            <Form.Label><Trans i18nKey='title'/><span className='redAsterisk'>*</span></Form.Label>
                            <Row>
                            <Col>
                            <Form.Label><Trans i18nKey='english'/><span className='redAsterisk'>*</span></Form.Label>
                            </Col>
                            <Col>
                            <Form.Label><Trans i18nKey='russian'/><span className='redAsterisk'></span></Form.Label>
                            </Col>
                            </Row>
                            <Row>
                            <Col>
                            <Form.Control required type="text" className="createFormPlaceHolder"
                                          placeholder={i18n.t('campaignTitle')}
                                          name='titleEn' value={this.state.titleEn} onChange={this.handleChange}/>
                            </Col>
                            <Col>
                            <Form.Control required type="text" className="createFormPlaceHolder"
                                          placeholder={i18n.t('campaignTitle')}
                                          name='titleRu' value={this.state.titleRu} onChange={this.handleChange}/>
                            </Col>
                            </Row>
                        </Form.Group>
                        <Form.Group>
                          <Form.Label><Trans i18nKey='shortDescription'/><span className='redAsterisk'>*</span></Form.Label>
                            <Row>
                            <Col>
                            <Form.Label><Trans i18nKey='english'/><span className='redAsterisk'>*</span></Form.Label>
                            </Col>
                            <Col>
                            <Form.Label><Trans i18nKey='russian'/><span className='redAsterisk'></span></Form.Label>
                            </Col>
                            </Row>
                            <Row>
                            <Col>
                            <Form.Control required as="textarea" rows={3} className="createFormPlaceHolder"
                                          placeholder={i18n.t('descriptionOfCampaign')}
                                          name='descriptionEn' value={this.state.descriptionEn}
                                          maxLength='195' onChange={this.handleChange}/>
                            </Col>
                            <Col>
                            <Form.Control required as="textarea" rows={3} className="createFormPlaceHolder"
                                          placeholder={i18n.t('descriptionOfCampaign')}
                                          name='descriptionRu' value={this.state.descriptionRu}
                                          maxLength='195' onChange={this.handleChange}/>
                            </Col>
                            </Row>
                            <Form.Label><Trans i18nKey='campaignDescription'/><span className='redAsterisk'>*</span></Form.Label>
                            <Row>
                            <Col>
                            <Form.Label><Trans i18nKey='english'/><span className='redAsterisk'>*</span></Form.Label>
                            </Col>
                            <Col>
                            <Form.Label><Trans i18nKey='russian'/><span className='redAsterisk'></span></Form.Label>
                            </Col>
                            </Row>
                            <Row>
                            <Col>
                            {this.state.updatedEditorStateEn && <TextEditorEn  />}
                            </Col>
                            <Col>
                            {this.state.updatedEditorStateRu && <TextEditorRu  />}
                            </Col>
                            </Row>
                        </Form.Group>
                        <div className='titles'><Trans i18nKey='contactInform'/></div>
                        <Form.Group>
                         <Form.Group>
                          <Form.Label><Trans i18nKey='email'/><span className='redAsterisk'>*</span></Form.Label>
                          <Form.Control required type="text" className="createFormPlaceHolder"
                           placeholder={i18n.t('contactPlaceHolder')} name='email' value={this.state.email} onChange={this.handleChange}/>
                         </Form.Group>
                         <Form.Group>
                          <Form.Label><Trans i18nKey='phoneNumber'/></Form.Label>
                          <Row>
                            <Col xs = {5}>
                            <Form.Label><Trans i18nKey='countryCode'/><span className='redAsterisk'></span></Form.Label>
                            </Col>
                            <Col xs={7}>
                            <Form.Label><Trans i18nKey='number'/><span className='redAsterisk'></span></Form.Label>
                            </Col>
                          </Row>
                          <Row>
                           <Col xs = {5}>
                           <Form.Control required as="select" name='countryCode' value={this.state.countryCode} onChange={this.handleChange}>
                                <option> </option>
                                {countries.map((data) =>
                                   <option disabled={getCountryCodeForRegionCode(data.value) === 0} value={"+" + getCountryCodeForRegionCode(data.value)} >{data.text} {"+" + getCountryCodeForRegionCode(data.value)}</option>
                                    )}
                                </Form.Control>
                           </Col>
                           <Col xs={7}>
                            <Form.Control required type="text" className="createFormPlaceHolder"
                             placeholder={i18n.t('contactPlaceHolder')} name='number' value={this.state.number} onChange={this.handleChange}/>
                           </Col>
                          </Row>
                         </Form.Group>
                         <Form.Group>
                          <Form.Label>Telegram</Form.Label>
                          <Form.Control required type="text" className="createFormPlaceHolder"
                           placeholder={i18n.t('contactPlaceHolder')} name='telegram' value={this.state.telegram} onChange={this.handleChange}/>
                         </Form.Group>
                        </Form.Group>
                            <Row>
                             <Col>
                              {this.state.addresses[this.state.chainId] &&
                                <Form.Label><span><CheckCircle style={{color:'#E63C36'}} /> </span>
                                <Trans i18nKey='campaignInEtereum'/><span className='redAsterisk'></span></Form.Label>}
                             </Col>
                             <Col>
                              {this.state.addresses[this.state.tronChainId] &&
                                <Form.Label><span><CheckCircle style={{color:'#E63C36'}} /> </span>
                                <Trans i18nKey='campaignInTron'/><span className='redAsterisk'></span></Form.Label>}
                             </Col>
                            </Row>
                        <Row>
                         <Col>
                          <Button onClick={() => this.handleClick()} id='createCampaignBtn' name='ff3'>
                            {i18n.t('saveCampaignBtn')}
                          </Button>
                         </Col>
                         <Col>
                          {(((!this.state.addresses[this.state.tronChainId])||(!this.state.addresses[this.state.chainId]))&&(window.ethereum||window.tron)&&(this.state.active)) &&
                            <DropdownButton size='lg' id="createCampaignBtn" title={i18n.t('deployBtn')} className='backToCampaigns'>
                             {(!this.state.addresses[this.state.chainId] && window.ethereum)&& <Dropdown.Item onClick={async() => {
                              await this.saveToEtherium(true);
                              }} >Etherium</Dropdown.Item>}
                             {(!this.state.addresses[this.state.tronChainId] && window.tron)&& <Dropdown.Item onClick={async() => {
                              await this.savetoTron(true);
                              }}>Tron</Dropdown.Item>}
                            </DropdownButton>}
                         </Col>
                        </Row>
                    </Form>
                </Container>
            </div>
        );
    }

    async getCampaignFromDB(id) {
        var campaign = {};
        var modalMessage = 'failedToLoadCampaign';
        let data = {ID : id};
        await axios.post('/api/campaign/loadOne', data, {headers: {"Content-Type": "application/json"}})
            .then(res => {
                campaign = res.data;
            }).catch(err => {
                if (err.response) {
                    modalMessage = 'technicalDifficulties'}
                else if(err.request) {
                    modalMessage = 'checkYourConnection'
                }
                console.log(err);
                this.setState({
                    showError: true,
                    modalMessage,
                })
            })

        return campaign;
    }

    async componentDidMount() {
        let chainId = config.get("CHAIN");
        let tronChainId = config.get("TRON_CHAIN");
        if(window.ethereum) await initWeb3Modal(chainId, this);
        if(window.tron) await initTronadapter();
        this.setState({
                chainId: chainId,
                tronChainId: tronChainId,
               });
        var id;
        var modalMessage = 'failedToLoadCampaign';
        let toks = this.props.location.pathname.split("/");
        ReactGA.send({ hitType: "pageview", page: this.props.location.pathname });
        let key = toks[toks.length -1];
        let data = {KEY : key};
        await axios.post('/api/campaign/getid', data, {headers: {"Content-Type": "application/json"}})
            .then(res => {
                id = res.data;
            }).catch(err => {
                if (err.response) {
                    modalMessage = 'technicalDifficulties'}
                else if(err.request) {
                    modalMessage = 'checkYourConnection'
                }
                console.log(err);
                this.setState({
                    showError: true,
                    modalMessage,
                })
            })
        let dbCampaignObj = await this.getCampaignFromDB(id);
        var orgObj = {};
        if(typeof dbCampaignObj.org == "string") {
            if ( dbCampaignObj.org.en) orgObj["en"] =  dbCampaignObj.org.en;
            else  orgObj["en"] = "";
            if ( dbCampaignObj.org.en) orgObj["ru"] =  dbCampaignObj.org.en;
            else  orgObj["ru"] = "";
        } else {
            orgObj = dbCampaignObj.org;
        }
        var titleObj = {};
        if(typeof dbCampaignObj.title == "string") {
            if ( dbCampaignObj.title.en) titleObj["en"] =  dbCampaignObj.title.en;
            else  titleObj["en"] = "";
            if ( dbCampaignObj.title.ru) titleObj["ru"] =  dbCampaignObj.title.ru;
            else  titleObj["ru"] = "";
        } else {
            titleObj = dbCampaignObj.title;
        }
        var descriptionObj = {};
        if(typeof dbCampaignObj.description == "string") {
            if ( dbCampaignObj.description.en) descriptionObj["en"] =  dbCampaignObj.description.en;
            else  descriptionObj["en"] = "";
            if ( dbCampaignObj.description.ru) descriptionObj["ru"] =  dbCampaignObj.description.ru;
            else  descriptionObj["ru"] = "";
        } else {
            descriptionObj = dbCampaignObj.description;
        }
        this.setState({
            campaignId : id,
            fn : dbCampaignObj.fn,
            ln : dbCampaignObj.ln,
            cn : dbCampaignObj.cn,
            vl : dbCampaignObj.vl,
            active : dbCampaignObj.active,
            imgID: dbCampaignObj.imgID,
            orgRu: orgObj["ru"],
            orgEn:orgObj["en"],
            ogOrg: orgObj,
            ogDescriptionEditor:dbCampaignObj.descriptionEditor,
             titleRu: titleObj["ru"],
            titleEn: titleObj["en"],
            ogTitle: titleObj,
            descriptionRu: descriptionObj["ru"],
            descriptionEn: descriptionObj["en"],
            ogDescription: descriptionObj,
            mainImageURL: dbCampaignObj.mainImageURL,
            maxAmount : dbCampaignObj.maxAmount,
            maxAmount_old : dbCampaignObj.maxAmount,
            addresses: dbCampaignObj.addresses,
            defDonationAmount: dbCampaignObj.defaultDonationAmount,
            fiatPayments: dbCampaignObj.fiatPayments
        });
        if (this.state.addresses[this.state.chainId]) this.setState({isInEtherium:true});
        else this.setState({isInEtherium:false});
        if (this.state.addresses[this.state.tronChainId]) this.setState({isInTron:true});
        else this.setState({isInTron:false});
        if(dbCampaignObj.descriptionEditor.en){
            setEditorStateEn(dbCampaignObj.descriptionEditor.en, true);
            this.setState({updatedEditorStateEn : true});
        }
        else{
            setEditorStateEn({}, false);
            this.setState({updatedEditorStateEn : true});
        }
        if(dbCampaignObj.descriptionEditor.ru){
            setEditorStateRu(dbCampaignObj.descriptionEditor.ru, true);
            this.setState({updatedEditorStateRu : true});
        }
        else{
            setEditorStateRu({}, false);
            this.setState({updatedEditorStateRu : true});
        }
        if (dbCampaignObj.key)
          this.setState({key : dbCampaignObj.key});
        if (dbCampaignObj.email)
          this.setState({email : dbCampaignObj.email});
        if (dbCampaignObj.countryCode)
          this.setState({countryCode : dbCampaignObj.countryCode});
        if (dbCampaignObj.number)
          this.setState({number : dbCampaignObj.number});
        if (dbCampaignObj.website)
          this.setState({website : dbCampaignObj.website});
        if (dbCampaignObj.telegram)
          this.setState({telegram : dbCampaignObj.telegram});
        console.log(`Set title to`);
        console.log(this.state.ogTitle);
        console.log(`Set org to`);
        console.log(this.state.ogOrg);
    }
}

function checkTransaction(txnObject, that) {
    if(txnObject.blockNumber) {
        that.state.web3.eth.getTransactionReceipt(txnObject.hash).then(function(txnObject) {
            if(txnObject.logs && txnObject.logs.length >2 && txnObject.logs[2] && txnObject.logs[2].topics && txnObject.logs[2].topics.length > 3) {
                that.state.addresses[this.state.chainId] = txnObject.logs[2].topics[1];
                that.state.line_accounts[this.state.chainId]  = txnObject.logs[2].topics[3];
                return(true);
            } else {
                this.setState({showModal: true, goHome: true,
                    modalTitle: 'addToDbFailedTitle',
                    modalMessage: 'addToDbFailedMessage',
                    modalIcon: 'CheckCircle',
                    modalButtonMessage: 'returnHome',
                    modalButtonVariant: "#588157", waitToClose: false
                });
                return (false);
            }
        });
    } else {
        that.state.web3.eth.getTransaction(txnObject.hash).then(function(txnObject) {
            checkTransaction(txnObject, that);
        });
    }
}

export default EditCampaign;
