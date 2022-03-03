import { AbstractWorldElement } from '../AbstractWorldElement.js'

// 约束
export class AbstractConstraint extends AbstractWorldElement {

  constructor() {
    super();
    // Defines whether the constraint can be broken
    // 定义是否可以打破约束
    this.breakable = false;
    // The maximum allowable breaking strain of the constraint
    // 约束的最大允许断裂应变
    this.breaking_strain = 2.0;
  }

  has_broken() {
    return false;
  }

}
