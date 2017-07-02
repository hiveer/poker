import React, { Component } from 'react';
import Join from 'components/Join/Join';
import Actions from 'components/Actions/Actions';
import Votes from 'components/Votes/Votes';
import Summary from 'components/Summary/Summary';
import './App.css';
import Cookies from 'js-cookie';
import io from 'socket.io-client';

class App extends Component {
  constructor(props) {
    super(props);
    this.initSocketConnection();
    this.state = {
      me: null,
      team: [],
      show: false
    };
  }

  initSocketConnection(){
    this.room = 'acl-grooming';
    this.socket = io(`http://localhost:4000`);

    this.socket.on('joined', this.reRender);
    this.socket.on('disconnected', this.reRender);
    this.socket.on('voted', this.reRender);
    this.socket.on('cleared', this.reRender);
  }

  reRender = (response) => {
    let me = response.team.find(client => client.name === Cookies.get('playerName'));
    let team = response.team.filter(client => client.name !== Cookies.get('playerName'));
    let show = response.show;

    this.setState({
      me,
      team,
      show
    });
  }

  handlePlayerJoin = (e) => {
    e.preventDefault();
    const { team } = this.state;
    const formData = new FormData(e.target);
    const name = formData.get('myName');
    const id = team.length + 1;

    Cookies.set('playerName', name);
    this.socket.emit('join', this.room, name);
  };

  handleVote = (e) => {
    this.socket.emit('vote', e.target.value);
  };

  handleToggleShow = () => {
    this.socket.emit('show', true);
  };

  handleClear= () => {
    this.socket.emit('clear');
  }

  render() {
    const { me, team, show } = this.state;
    return (
      <div className="App">
        {me ? (
          <Actions
            show={show}
            onVote={this.handleVote}
            onToggleShow={this.handleToggleShow}
            onClear={this.handleClear}/>
        ) : (
          <Join
            playerName={Cookies.get('playerName')}
            onSubmit={this.handlePlayerJoin} />
        )}
        <Votes
          me={me}
          team={team}
          show={show} />
        <Summary
            me={me}
            team={team}
            show={show} />
      </div>
    );
  }
}

export default App;
