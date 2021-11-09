import config from 'react-global-configuration';
import axios from 'axios';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { CheckCircle, HourglassSplit, XCircle } from 'react-bootstrap-icons';

class Utilities {

}

const clearWeb3Provider= async (that) => {
    if(that.state.web3 && that.state.web3.currentProvider && that.state.web3.currentProvider.close) {
        await that.state.web3.currentProvider.close();
    }
}

const LogIn = async (accountAdd, web3, that) => {
    that.setState({showModal:true, modalTitle: '',
        modalMessage: 'signThePhrase', modalIcon: 'HourglassSplit',
        modalButtonVariant: "#E63C36", waitToClose: false, modalButtonMessage: 'abortBtn',
            onModalClose: function() {
                clearWeb3Provider(that);
            }
        });
    let res = await axios.get('/api/auth/msg');
    let dataToSign = res.data.dataToSign;

    let signature = await web3.eth.personal.sign(dataToSign, accountAdd);
    let authRes = await axios.post('/api/auth/jwt',
        {signature: signature, addr: accountAdd},
        {headers: {"Content-Type": "application/json"}});
    that.setState({
        isLoggedIn: true, showModal: true, modalMessage: 'logInSuccess', modalTitle: 'success',
        modalIcon: 'CheckCircle', modalButtonVariant: "#588157", waitToClose: false,
        modalButtonMessage: 'closeBtn'
    });
    return authRes.data.success;

}

function DescriptionPreview(description) {
    var i = 200;
    if(description !== undefined ){
        let preview = description.trim();
        var firstSpace = preview.indexOf(" ");
        if(firstSpace >= 200){
            return preview.substring(0,200);
        } else if (preview.length <= 200) {
            return preview;
        } else {
            while(preview.charAt(i) != ' '  && i > 0){
                i--;
            }
            if(preview.charAt(i-1).match(/[.,?!]/)){
                return preview.substring(0, i-1);
            } else {
                return preview.substring(0, i);
            }
        }
    }
}

function GetLanguage() {
    let language = window.localStorage.getItem("heolang");
    language = language || navigator.language || navigator.userLanguage;
    return language;
}

const initWeb3 = async (that) => {
    var web3;
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        console.log("Injected web3 detected.");
    }
    var chainId = config.get("WEB3_HEX_CHAIN_ID");
    var currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if(currentChainId != chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainId }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: chainId,
                            rpcUrls: [config.get("WEB3_RPC_NODE_URL")],
                            chainName: config.get("CHAIN_NAME"),
                            blockExplorerUrls:[config.get("WEB3_BLOCK_EXPLORER_URL")]
                        }],
                    });
                } catch (addError) {
                    console.log(`Failed to add provider for ${chainId} and ${config.get("WEB3_RPC_NODE_URL")}`)
                    console.log(addError);
                }
            } else {
                console.log(`Failed to switch provider to ${chainId} and ${config.get("WEB3_RPC_NODE_URL")}`)
                console.log(switchError);
            }
        }
    }
    let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await that.setState({web3:web3, accounts: accounts});
    console.log(`Detected ${accounts.length} accounts: ${accounts}`);
}

const checkAuth = async (that, skipError=false) => {
    try {
        let res = await axios.get('/api/auth/status');
        if(res.data.addr) {
            if(!that.state.accounts) {
                await initWeb3(that);
            }
            if(that.state.accounts && that.state.accounts[0]) {
                if (that.state.accounts[0].toLowerCase() == res.data.addr.toLowerCase()) {
                    that.setState({isLoggedIn: true, showModal: false});
                } else {
                    //must have logged in with different account before
                    await axios.post('/api/auth/logout');
                }
            } else {
                that.setState({isLoggedIn: false, showModal: false});
                await axios.post('/api/auth/logout');
            }
        }
    } catch (err) {
        if(!skipError) {
            that.setState({
                showModal: true,
                isLoggedIn: false,
                goHome: true,
                modalTitle: 'authFailedTitle',
                modalMessage: 'technicalDifficulties',
                modalIcon: 'XCircle', modalButtonMessage: 'returnHome',
                modalButtonVariant: "#E63C36", waitToClose: false});
        }
    }
}

const initWeb3Modal = async() => {
    let rpc = {};
    rpc[config.get("WEB3_RPC_CHAIN_ID")] = config.get("WEB3_RPC_NODE_URL");
    if(!window.web3Modal) {
        window.web3Modal = new Web3Modal({
            cacheProvider: true,
            providerOptions: {
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        rpc: rpc,
                        chainId: config.get("WEB3_RPC_CHAIN_ID"),
                        bridge: config.get("WC_BRIDGE_URL"),
                        network: config.get("WC_CHAIN_NAME")
                    }
                }
            }
        });
    }
}
export {DescriptionPreview, GetLanguage, LogIn, initWeb3, checkAuth, initWeb3Modal, clearWeb3Provider };
export default Utilities;