import React from "react";
import { inject, observer } from "mobx-react";

@inject("levelStore")
@observer
export class PlayerHud extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  componentWillMount() {}

  render() {
    return <div>Player Hud</div>;
  }
}
