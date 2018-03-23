import { types, getParent } from "mobx-state-tree";
import { getRandomInt, getRandomElement } from "Utils/math-utils";

const getGridKey = (x, y) => {
  return `${x}-${y}`;
};

export const GridItem = types.model("GridItem", {
  id: types.identifier(),
  name: types.string
});

export const Character = types
  .model("Character", {
    id: types.identifier(),
    name: types.string,
    isPlayer: false,
    positionX: types.maybe(types.number),
    positionY: types.maybe(types.number)
  })
  .views(self => ({
    getCurrentGrid() {
      return getParent(self).grids[getGridKey()];
    }
  }))
  .actions(self => {
    const moveToPosition = (x, y) => {
      self.positionX = x;
      self.positionY = y;
    };
    return {
      moveToPosition
    };
  });

Character.createPlayer = () => {
  return Character.create({
    id: "player",
    name: "player",
    isPlayer: true
  });
};

export const Grid = types
  .model("Grid", {
    id: types.identifier(types.string),
    x: types.number,
    y: types.number,
    visited: false,
    movement: types.number,
    isValidMove: false,
    isStartGrid: false,
    isExitGrid: false,
    isPassable: false,
    isEnterable: false
  })
  .actions(self => {
    return {};
  });

export const LevelStore = types
  .model("LevelStore", {
    isInitialized: false,
    isGenerating: false,
    width: types.number,
    height: types.number,
    //grids: types.map(Grid),
    grids: types.array(types.array(Grid)),
    items: types.array(GridItem), // items currently in this level
    characters: types.array(Character), // characters currently in this level
    player: types.maybe(types.reference(Character)) // should reference one of the characters in this.characters
  })

  .views(self => ({
    isPlayerAtExit() {
      return false;
    },
    isPlayerStuck() {
      return false;
    },
    getTotalGridCount() {
      let count = 0;
      for (let i = 0; i < self.width; i++) {
        for (let j = 0; j < self.height; j++) {
          if (self.grids[i][j].movement) {
            count += 1;
          }
        }
      }
      return count + 1;
    },
    getVisitedGridCount() {
      let count = 0;
      for (let i = 0; i < self.width; i++) {
        for (let j = 0; j < self.height; j++) {
          if (self.grids[i][j].visited) {
            count += 1;
          }
        }
      }
      return count;
    }
  }))
  .actions(self => {
    const setIsGenerating = generating => {
      self.isGenerating = generating;
    };

    const initialize = (width, height) => {
      self.width = width;
      self.height = height;
      let grids = [];
      for (let x = 0; x < width; x++) {
        let row = [];
        for (let y = 0; y < height; y++) {
          const grid = Grid.create({
            x,
            y,
            id: getGridKey(x, y),
            movement: 0
          });
          row.push(grid);
        }
        grids.push(row);
      }
      self.grids = grids;
      self.generateLevel();
      self.isInitialized = true;
    };

    const generateLevel = () => {
      // start pt not on edge
      const startX = getRandomInt(1, self.width - 2);
      const startY = getRandomInt(1, self.height - 2);

      self.player = Character.createPlayer();
      self.characters.push(self.player);

      const totalSteps = Math.ceil(self.width * self.height / 3 * 2);
      let thisStep = 0;

      const map = [];
      for (let i = 0; i < self.width; i++) {
        const row = [];
        for (let j = 0; j < self.height; j++) {
          row.push({
            movement: 0,
            step: null,
            visitCount: 0
          });
        }
        map.push(row);
      }

      let currentX = startX;
      let currentY = startY;
      // returns a list of possible next locations to jump to, array of object:
      // [ { x: 1, y: 3, distance: 3 }, {...}... ]
      const getPossibleNextGrids = (map, currentX, currentY) => {
        const results = [];
        let grid;
        // check left
        for (let x = currentX - 1; x >= 0; x--) {
          grid = map[x][currentY];
          if (grid.visitCount === 0) {
            results.push({
              x,
              y: currentY,
              distance: currentX - x
            });
          }
        }
        // check right
        for (let x = currentX + 1; x < self.width; x++) {
          grid = map[x][currentY];
          if (grid.visitCount === 0) {
            results.push({
              x,
              y: currentY,
              distance: x - currentX
            });
          }
        }
        for (let y = currentY - 1; y >= 0; y--) {
          grid = map[currentX][y];
          if (grid.visitCount === 0) {
            results.push({
              x: currentX,
              y,
              distance: currentY - y
            });
          }
        }
        for (let y = currentY + 1; y < self.height; y++) {
          grid = map[currentX][y];
          if (grid.visitCount === 0) {
            results.push({
              x: currentX,
              y,
              distance: y - currentY
            });
          }
        }
        return results;
      };

      let nextGridMaps, nextGridMap, thisGrid;
      while (thisStep < totalSteps) {
        nextGridMaps = getPossibleNextGrids(map, currentX, currentY);
        if (nextGridMaps.length === 0) {
          break;
        }
        nextGridMap = getRandomElement(nextGridMaps);

        // update our actual MST grid model
        thisGrid = self.grids[currentX][currentY];
        thisGrid.nextGrid = self.grids[(nextGridMap.x, nextGridMap.y)];
        thisGrid.movement = nextGridMap.distance;
        thisGrid.isEnterable = true;

        // update our in progress map
        map[nextGridMap.x][nextGridMap.y].visitCount += 1;
        map[nextGridMap.x][nextGridMap.y].step = thisStep;
        map[currentX][currentY].movement = nextGridMap.distance;

        currentX = nextGridMap.x;
        currentY = nextGridMap.y;

        thisStep += 1;
      }

      // mark current tile as exit
      thisGrid = self.grids[currentX][currentY];
      thisGrid.isExitGrid = true;
      thisGrid.isEnterable = true;

      self.movePlayerToPosition(startX, startY);
    };

    const movePlayerToPosition = (x, y) => {
      const grid = self.grids[x][y];
      grid.visited = true;
      const movement = self.grids[x][y].movement;

      self.player.moveToPosition(x, y);

      for (let i = 0; i < self.width; i++) {
        for (let j = 0; j < self.height; j++) {
          let thisGrid = self.grids[i][j];
          if (!thisGrid.isEnterable || thisGrid.visited) {
            grid.isValidMove = false;
          } else {
            if (i === x && Math.abs(j - y) === movement) {
              thisGrid.isValidMove = true;
            } else if (j === y && Math.abs(i - x) === movement) {
              thisGrid.isValidMove = true;
            } else {
              thisGrid.isValidMove = false;
            }
          }
        }
      }

      if (grid.isExitGrid) {
        alert(
          "Exited with score of " +
            self.getVisitedGridCount() +
            " of " +
            self.getTotalGridCount()
        );
      }
    };

    return {
      generateLevel,
      movePlayerToPosition,
      setIsGenerating,
      initialize
    };
  });
