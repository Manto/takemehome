import React from "react";
import { inject, observer } from "mobx-react";
import { modelOf } from "Utils/mobx-utils";
import { Character, Grid } from "Stores/LevelStore";
import "./GameLevel.css";

@inject("levelStore")
@observer
export class GameLevel extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  componentWillMount() {}

  render() {
    const { levelStore } = this.props;

    if (levelStore.isInitialized) {
      return (
        <div className="grid-row">
          {levelStore.grids.map((row, i) => {
            return (
              <div key={i}>
                {row.map((grid, j) => {
                  return <LevelGridSprite key={j} data={grid} />;
                })}
              </div>
            );
          })}
          {levelStore.characters.map((character, i) => {
            return <CharacterSprite key={i} data={character} />;
          })}
        </div>
      );
    } else {
      return <div>...</div>;
    }
  }
}

@inject("levelStore")
@observer
export class GameLevelHud extends React.Component {
  render() {
    const { levelStore } = this.props;
    return (
      <div>
        Visited: {levelStore.getVisitedGridCount()} /{" "}
        {levelStore.getTotalGridCount()}
      </div>
    );
  }
}

@inject("levelStore")
@observer
class CharacterSprite extends React.Component {
  render() {
    const { data } = this.props;
    return (
      <div
        className="character"
        style={{ left: data.positionX * 75, top: data.positionY * 75 }}
      >
        <span className="character-label">
          {data.isPlayer ? "PLAYER" : data.name}
        </span>
      </div>
    );
  }
}

CharacterSprite.propTypes = {
  data: modelOf(Character)
};

@inject("levelStore")
@observer
class LevelGridSprite extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  onClick = () => {
    if (this.props.data.isValidMove) {
      this.props.levelStore.movePlayerToPosition(
        this.props.data.x,
        this.props.data.y
      );
    }
  };

  render() {
    const { data } = this.props;

    let className = "grid-box";
    if (!data.isPassable) {
      className += " grid-impassable";
    }
    if (!data.isPassable) {
      className += " grid-blocked";
    }
    if (data.isValidMove) {
      className += " grid-active";
    }
    if (data.visited) {
      className += " visited";
    }

    return (
      <div
        className={className}
        style={{ left: data.x * 75, top: data.y * 75 }}
        onClick={this.onClick}
      >
        {data.movement > 0 && (
          <div className="grid-movement-text">{data.movement}</div>
        )}
        {data.isExitGrid && <div className="grid-movement-text">EXIT</div>}
      </div>
    );
  }
}

LevelGridSprite.propTypes = {
  data: modelOf(Grid)
};
