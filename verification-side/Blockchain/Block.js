const crypto = require("crypto");
class Block{
    constructor(index,timeStamp,data,cpi,previousHash){
        this.index = index;
        this.timeStamp = timeStamp;
        this.data = data;
        this.cpi = cpi;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        const hashString = this.index + this.timeStamp + this.previousHash + JSON.stringify(this.data) + this.cpi;
        return crypto.createHash('sha256').update(hashString).digest('hex');
    }
}

module.exports = Block;