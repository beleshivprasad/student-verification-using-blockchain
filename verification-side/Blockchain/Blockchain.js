const Block = require('./Block');
const mongourl = "mongodb+srv://project:project@cluster0.s80ou.mongodb.net/college-side-db?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const { ObjectID } = require( 'mongodb' );
// Connecting To Database
// using Mongo Atlas as database
mongoose.connect(
    mongourl,
    {
    useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true
    },
    function(error,link){
        if(link){
            console.log("DB connect success(Blockchain)");
        }
        else
            console.log("DB connect fail..!");
    }
);

class Blockchain{
    constructor(){
        this.chain = [new Block(0,Date.now(),"Genesis Block",0,'0')];
    }

    getPreviousHash(){
        return this.chain[this.chain.length - 1].hash;
    }

    addBlock(data,cpi){
        const index = this.chain.length;
        const timeStamp = Date.now();
        const previousHash = this.getPreviousHash();
        let checkPRN = data.prn_no;
        const newBlock = new Block(index,timeStamp,data,cpi,previousHash);
        if(this.isValid){
            this.chain.push(newBlock);
        }
        else{
            "Invalid Block Insertion"
        }
    }
    
    isValid(newBlock){
        const currentBlock = this.chain[this.chain.length - 1];
        if(currentBlock.hash != newBlock.hash){
            return false;
        }
        else if(newBlock.hash != newBlock.calculateHash()){
            return false;
        }
        else {
            return true;
        }
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
    printChain(){
        console.log(this.chain);
    }
}


module.exports = Blockchain;