import { observable, action } from "mobx";

export class LevelStore {
  // this is an array of arrays - access via [x][y]
  @observable grids = [];
  @observable width = 0;
  @observable height = 0;
  @observable initialized = false;

  @action
  resetLevelGridSize(width, height) {
    this.width = width;
    this.height = height;
    this.grids = [];
    for (let x = 0; x < width; x++) {
      let row = [];
      for (let y = 0; y < height; y++) {
        const grid = new GridData();
        grid.x = x;
        grid.y = y;
        row.push(grid);
      }
      this.grids.push(row);
    }
  }

  @action
  generateLevel(width, height) {
    this.resetLevelGridSize(width, height);

    this.initialized = true;
  }

  _getGrid = (x, y) => {
    return this.grids[x][y];
  };
}

export class GridData {
  @observable x = undefined;
  @observable y = undefined;
  @observable visited = false;
  @observable items = [];
  @observable isStartGrid = false;
  @observable isExitGrid = false;
  @observable isPassable = false;
  @observable isEnterable = false;
}

export default new LevelStore();
