import React from "react";
import { inject, observer } from "mobx-react";
import { GameLevel, GameLevelHud } from "./components/GameLevel";
import { PlayerHud } from "./components/PlayerHud";
import "./App.css";

@inject("levelStore")
@observer
export default class App extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  componentWillMount() {
    this.props.levelStore.initialize(8, 8);
  }

  render() {
    const { levelStore } = this.props;
    return (
      <div>
        <div className="App">
          {levelStore.isInitialized ? (
            <div>
              <GameLevelHud />
              <GameLevel />
            </div>
          ) : (
            <div>initializing...</div>
          )}
        </div>
      </div>
    );
  }
}
