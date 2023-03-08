const { Gateway, Wallets, DefaultEventHandlerStrategies } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('test-network');
const util = require('util')

const auth = require('./auth');
const { CLIENT_RENEG_LIMIT } = require('tls');

const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name ) => {
    try {
        logger.debug(util.format('\n============ invoke transaction on channel %s ============\n', channelName));

      
        const ccp = await auth.getCCP(org_name)

        // Create a new file system based wallet for managing identities.
        const walletPath = await auth.getWalletPath(org_name) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);    
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(username);
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await auth.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }
                   console.log('---------- channelName and chaincodeName successfully checked --------------')
        

        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            }
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        const contract = network.getContract(chaincodeName);

        let result
        let message;
        
        // addHospitals(ctx, hospitalid,hosptialname,hospitalLocation,timestamp)
        if (fcn === "addHospitals") {
            let timestamp = new Date (); 
            result = await contract.submitTransaction(fcn, args[0], args[1], args[2], timestamp);
            message = ` hospital added Successfully ${args[0]} with name ${args[1]}}`;
            console.log(`event for addHospitals ${message} `)
            // console.log("TxID:", result.GetTxID());
         }

        //  addPatient(ctx, patientId,hospitalid,patientName, patientPhone, patientEmail,patientAddress,timestamp)
         else if (fcn === "addPatient") {
            let timestamp = new Date (); 
            result = await contract.submitTransaction(fcn, args[0], args[1],args[2],args[3],args[4],args[5], timestamp);
            message = `patient added successfully with id: ${args[0]} of user ${args[1]}}`;
            console.log(`event for addPatient ${message} `)
            // console.log("TxID:", result.GetTxID());
         }
        
        else {
            return `Invocation require either createMaturity or createCO2Emissions as function but got ${fcn}`
        }

        await gateway.disconnect();

        // result = JSON.parse(result);

        let response = {
            message: message,
            result
        }

        return response;


    } catch (error) {

        console.log(`Getting error: ${error}`)
        return error.message

    }
}

exports.invokeTransaction = invokeTransaction;