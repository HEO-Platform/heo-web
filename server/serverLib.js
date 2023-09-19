const { registerRequestInstrumentation } = require('@sentry/tracing');
const { default: axios } = require('axios');
const { ObjectId } = require('mongodb');
const {Web3} = require('web3');
const nodemailer = require('nodemailer');


class ServerLib {
    constructor() {
    }
    
    testingClass() {
        console.log('server library class');
    }

    handleUploadImage(req, res, S3, Sentry) {
        const PARAMS = {
            Bucket: process.env.SERVER_APP_BUCKET_NAME,
            Key: process.env.SERVER_APP_IMG_DIR_NAME + '/' + req.files.myFile.name,
            Body: req.files.myFile.data
        }
        S3.upload(PARAMS, (error, data) => {
            console.log('real upload called');
            if (error) {
                Sentry.captureException(new Error(error));
                res.sendStatus(500);
            } else {
              res.send(data.Location);
            }
        });
    }

    handleDeleteImage(req, res, S3, Sentry) {
        const PARAMS = {
            Bucket: process.env.SERVER_APP_BUCKET_NAME,
            Key: process.env.SERVER_APP_IMG_DIR_NAME + '/' + req.body.name,
        }
        S3.deleteObject(PARAMS, (error, data) => {
            if (error) {
                Sentry.captureException(new Error(error));
                res.sendStatus(500);
            } else {
                res.send('complete');
            }
        });
    }

    async handleSendEmail(req, res, Sentry, key, text, DB){
       try{
        const emailCollection = await DB.collection('global_configs');
        let result = await emailCollection.findOne({"_id" : key}); 
        console.log("result");
        console.log(result);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: result.user,
              pass: result.pass
            }
          });
         await transporter.sendMail({
            from: result.from, // sender address
            to: result.to, // list of receivers
            subject: result.subject, // Subject line
            text: text // html body
          }).then(info => {
            console.log({info});
            res.send('success');
          }).catch(console.error); 
       } catch (err) {
        Sentry.captureException(new Error(err));
        res.sendStatus(500);
       }
    }

    async handleAddDanate(req, res, Sentry, DB){
        const ITEM = {
            campaignID: req.body.mydata.campaignID.toLowerCase(),
            donatorID: req.body.mydata.donatorID.toLowerCase(),
            raisedAmount: req.body.mydata.raisedAmount,
            transactionHash: req.body.mydata.transactionHash,
            chainId: req.body.mydata.chainId,
            coinAddress: req.body.mydata.coinAddress,
            donateDate: Date.now(),
            deleted: false,
            checked: false
        }
        
        try {
            const myCollection = await DB.collection('donations');
            await myCollection.insertOne(ITEM);
            res.send('success');
        } catch (err) {
            Sentry.captureException(new Error(err));
            res.sendStatus(500);
        }
    } 

    async handleAddCampaign(req, res, Sentry, DB, newWalletId) {
        const ITEM = {
            _id: req.body.mydata.address.toLowerCase(),
            beneficiaryId: req.body.mydata.beneficiaryId.toLowerCase(),
            ownerId: req.user.address.toLowerCase(),
            title: req.body.mydata.title,
            mainImageURL: req.body.mydata.mainImageURL,
            qrCodeImageURL: req.body.mydata.qrCodeImageURL,
            vl: req.body.mydata.vl,
            cn: req.body.mydata.cn,
            fn: req.body.mydata.fn,
            ln: req.body.mydata.ln,
            org: req.body.mydata.org,
            key: req.body.mydata.key,
            description: req.body.mydata.description,
            defaultDonationAmount: req.body.mydata.defaultDonationAmount,
            coinbaseCommerceURL: req.body.mydata.coinbaseCommerceURL,
            fiatPayments: req.body.mydata.fiatPayments,
            currencyName: req.body.mydata.currencyName,
            maxAmount: req.body.mydata.maxAmount,
            descriptionEditor: req.body.mydata.descriptionEditor,
            walletId: newWalletId,
            raisedAmount: 0,
            creationDate: Date.now(),
            lastDonationTime: 0,
            coins: req.body.mydata.coins,
            addresses: req.body.mydata.addresses,
            active: false,
            new: true
        }
        try {
            const myCollection = await DB.collection('campaigns');
            await myCollection.insertOne(ITEM);
            return true
        } catch (err) {
            Sentry.captureException(new Error(err));
            return false;
        }
    }

    async handleUpdateCampaign(req, res, Sentry, DB) {
        let result;
        try {
            const myCollection = await DB.collection('campaigns');
            result = await myCollection.findOne({"_id" : req.body.mydata.address});
        } catch (err) {
            Sentry.captureException(new Error(err));
        }
        if(!result || result.ownerId != req.user.address.toLowerCase()) {
            Sentry.captureException(new Error(`Campaign's ownerId (${result.ownerId}) does not match the user (${req.user.address})`));
            res.sendStatus(500);
            console.log(`Campaign's ownerId (${result.ownerId}) does not match the user (${req.user.address})`);
        } else {
            try{
                const myCollection = await DB.collection('campaigns');
                await myCollection.updateOne({'_id': req.body.mydata.address}, {$set: req.body.mydata.dataToUpdate});
                res.send('success');
            } catch (err) {
                Sentry.captureException(new Error(err));
                res.sendStatus(500);
            }
        }
    }

    async handleDeactivateCampaign(req, res, Sentry, DB) {
        let myCollection = await DB.collection("campaigns");
        let result = await myCollection.findOne({"_id" : req.body.id});
        if(!result || result.ownerId != req.user.address.toLowerCase()) {
            res.sendStatus(500);
            console.log(`Campaign's ownerId (${result.ownerId}) does not match the user (${req.user.address})`);
        } else {
            try {
                const myCollection = await DB.collection('campaigns');
                await myCollection.updateOne({'_id': req.body.id}, {$set: {active:false}});
                res.send('success');
            } catch (err) {
                Sentry.captureException(new Error(err));
                res.sendStatus(500);
            }
        }
    }

    async handleLoadAllCampaigns(req, res, Sentry, DB) {
        try{
           
            const emailCollection = await DB.collection('email_config');
            const myCollection = await DB.collection('campaigns');
            const campaigns = await myCollection.find({active: true});
            const sortedCampaigns = await campaigns.sort({"lastDonationTime" : -1});
            const result = await sortedCampaigns.toArray();
            res.send(result);
        } catch (err) {
            Sentry.captureException(new Error(err));
            res.sendStatus(500);
        }
    }

    async handleGetAllDonateForCampaign(req, res, Sentry, DB){
        try {  
        let result = await DB.collection('donations').find({campaignID: req.body.mydata.campaignID});
        if (result.length == 0) res.send(0);
        else
        {
         const pipeline = [
          { $match: {campaignID: req.body.mydata.campaignID, deleted : false } },
           {$group: { _id: null, totalQuantity: { $sum: "$raisedAmount" } }}  
         ];
         result = await DB.collection('donations').aggregate(pipeline).toArray();
         res.send(result);
        }      
       } catch (err) {
        Sentry.captureException(new Error(err));
        res.send("error");
       }  
    }

    async handleGetAllDonateForList(req, res, Sentry, DB){
        try {
            const pipeline = [
                { $match: { deleted : false } },
                {$group: { _id: '$campaignID', totalQuantity: {$sum: "$raisedAmount"}}}  
            ];
            let result = await DB.collection('donations').aggregate(pipeline).toArray();
            res.send(result);  
       } catch (err) {
        Sentry.captureException(new Error(err));
        res.sendn("error");
       }  
    }
  
    async handleGetId(req, res, Sentry, DB) {
        try {
            const myCollection = await DB.collection('campaigns');
            let result = await myCollection.findOne({"key" : req.body.KEY, active: true});
            if (result) res.send(result._id)
            else res.send(req.body.KEY);
        } catch (err) {Sentry.captureException(new Error(err));}
    }

    async handleGetCoinsList(req, res, Sentry, DB) {
        try {
            const myCollection = await DB.collection('coins_for_chains');
            let coins = await myCollection.find();//aggregate([{$group:{ _id : "$chain", coins:{$push: "$coin"}}}]);
            const result = await coins.toArray();
            res.send(result);
        } catch (err) {Sentry.captureException(new Error(err));}
    }

    async handleGetChainsLis(req, res, Sentry, DB) {
        try {
            const myCollection = await DB.collection('coins_for_chains');
            let chains = await myCollection.distinct("chain");
            const result = await chains.toArray();
            res.send(result._id);
        } catch (err) {Sentry.captureException(new Error(err));}
    }

    async handleLoadOneCampaign(req, res, Sentry, DB) {
        try {
            const myCollection = await DB.collection('campaigns');
            let result = await myCollection.findOne({"_id" : req.body.ID});
            res.send(result);
        } catch (err) {Sentry.captureException(new Error(err));}
    }

    async handleLoadUserCampaigns(req, res, Sentry, DB) {
        try{
            const key = "addresses." + req.body.fieldName;
            const myCollection = await DB.collection('campaigns');
            const campaigns = await myCollection.find({"ownerId" : {$eq: req.user.address},[key]:{ $exists : true }, active: true});
            const result = await campaigns.toArray();
            res.send(result);
        } catch (err) {
            Sentry.captureException(new Error(err));
            res.sendStatus(500);
        }
    }

    async handleLoadEnv(res, envCHAIN, envTRONCHAIN, Sentry, DB) {
        try{
            let chainCollection = await DB.collection('chain_configs');
            let chain_configsRaw = await chainCollection.find();
            let chain_configs = await chain_configsRaw.toArray();
            var chains = {};
            for (let i=0; i<chain_configs.length; i++) {
                chains[chain_configs[i]._id] = chain_configs[i];
            }
            let globalCollection = await DB.collection('global_configs');
            let global_configsRaw = await globalCollection.find();
            let global_configs = await global_configsRaw.toArray();
            res.json(
                {
                    CHAINS: chains,
                    CHAIN: envCHAIN,
                    TRON_CHAIN: envTRONCHAIN,
                    GLOBALS: global_configs,
                });

        } catch (err) {
            Sentry.captureException(new Error(err));
        }
    }

    //create initial payment record in mongodb
    async createPaymentRecord(data, CLIENT, DBNAME, Sentry) {
        console.log('creating payment record' + data);
        const DB = CLIENT.db(DBNAME);
        try {
            const myCollection = await DB.collection('fiat_payment_records');
            await myCollection.insertOne(data);
        } catch (err) {Sentry.captureException(new Error(err))}
    }

    //update payment record in mongodb
    async updatePaymentRecord(recordId, data, CLIENT, DBNAME, Sentry) {
        const DB = CLIENT.db(DBNAME);
        try{
            const myCollection = await DB.collection('fiat_payment_records');
            await myCollection.updateOne({'_id': recordId}, {$set: data});
        }
        catch (err) {Sentry.captureException(new Error(err))}
    }

    async authenticated(req, res, Sentry) {
        if(req.user && req.user.address) {
          return true;
        } else {
            Sentry.captureException(new Error('Failed 401'));
            res.sendStatus(401);
            return false;
        }
    }

    async handleGetFiatPaymentSettings(DB, Sentry) {
        try {
            let configCollection = await DB.collection('global_configs');
            let fiatSettingsRAW = await configCollection.find({_id : 'FIATPAYMENT'});
            let fiatSettings = await fiatSettingsRAW.toArray();
            if(fiatSettings[0].enabled) {
                if(fiatSettings[0].CIRCLE && !fiatSettings[0].PAYADMIT) {
                    return 'circleLib';
                } else if (!fiatSettings[0].CIRCLE && fiatSettings[0].PAYADMIT) {
                    return 'payadmitLib';
                }
            }
            return;
        } catch (err) {Sentry.captureException(new Error(err))};
    }
}

module.exports = ServerLib;
