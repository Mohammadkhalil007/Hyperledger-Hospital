

'use strict';

const {Contract} = require('fabric-contract-api');

class Transaction extends Contract {
    
    async initLedger(ctx) {
        console.info('============= Initialize Ledger ===========');
        await ctx.stub.putState("Patient_Managment_System", "Patients Managment Sytem is Configured Successfully")
        return "success"
    }    
    /**********************************************************************************
     * Hospitals
     * 
     */
     async addHospitals(ctx, hospitalid,hosptialname,hospitalLocation,timestamp){
        console.info('============= START : add Hosptials ===========');
        const allHospitals = {
            docType:"addHospitals",
            hospitalid,
            hosptialname,
            hospitalLocation,
            timestamp
        };
        console.log("Hospital Record is successfully added ",allHospitals)
        await ctx.stub.putState(hospitalid, Buffer.from(JSON.stringify(allHospitals)));
        console.info(`============= END : add Hospital Successfully ${allHospitals}===========`);
        return  allHospitals
     }

     async queryHospital(ctx, hospitalId) {
        const hospitalAsBytes = await ctx.stub.getState(hospitalId); // get the patient from chaincode state
        if (!hospitalAsBytes || hospitalAsBytes.length === 0) {
            throw new Error(`${hospitalId} does not exist`);
        }
        console.log(hospitalAsBytes.toString());
        return hospitalAsBytes.toString();
    }
     /**********************************************************************************
     * Patients
     * 
     */
    async addPatient(ctx, patientId,hospitalid,patientName, patientPhone, patientEmail,patientAddress,timestamp) {
        console.info('============= START : add Patient ===========');
    //    console.log(queryHospital(hospitalid));
        const hosptialAsBytes = await ctx.stub.getState(hospitalid);
        console.log("***************",hosptialAsBytes);
        if (!hosptialAsBytes || hosptialAsBytes.length === 0) {
            throw new Error(`${hosptialAsBytes} does not exist`);
        }

        const patientRec = {
            docType:"addPatient",
            patientId,
            hospitalid,
            patientName,
            patientPhone,
            patientEmail,
            patientAddress,
            timestamp
        };
        console.log("patient Record is successfully added ",patientRec)
        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patientRec)));
        console.info('============= END : add Patient Successfully ===========');
        // return PatientAsBytes.toString();
    }

    async queryPatient(ctx, patientId) {
        const PatientAsBytes = await ctx.stub.getState(patientId); // get the patient from chaincode state
        if (!PatientAsBytes || PatientAsBytes.length === 0) {
            throw new Error(`${patientId} does not exist`);
        }
        console.log(PatientAsBytes.toString());
        return PatientAsBytes.toString();
    }

    async queryAllPatients(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
}
module.exports = Transaction;