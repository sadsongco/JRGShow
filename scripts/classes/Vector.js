export default class Vector {
    constructor(x, y, z = false) {
        this.x = parseInt(x);
        this.y = parseInt(y);
        this.z = parseInt(z);
    }
    magSq() {
        if (this.z)
            return (this.x * this.x) + (this.y * this.y) + (this.z + this.z);
        return (this.x * this.x) + (this.y * this.y);
    }
    distSq(targetVector) {
        if (this.z)
            return ((this.x - targetVector.x) * (this.x - targetVector.x)) + ((this.y - targetVector.y) * (this.y - targetVector.y)) + ((this.z - targetVector.z) * (this.z - targetVector.z));
        return ((this.x - targetVector.x) * (this.x - targetVector.x)) + ((this.y - targetVector.y) * (this.y - targetVector.y));
    }
}