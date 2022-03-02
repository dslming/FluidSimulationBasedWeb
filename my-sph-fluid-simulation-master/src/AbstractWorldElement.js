// Abstract world element class
export class AbstractWorldElement {

  constructor() {
    // The length of time that the world element has been in existence (number of simulation steps)
    this.age = 0;
    // The age at which the world element will be deleted, null if infinite life
    this.lifetime = null;
  }

  // Check to see whether the age of a world element has reached its life
  has_life_expired() {
    if ((this.lifetime !== null) && (this.age >= this.lifetime)) {
      return true;
    } else {
      return false;
    }
  }

}
