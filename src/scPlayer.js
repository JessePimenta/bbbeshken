import SC from 'soundcloud';
export default class SCPlayer {

  constructor(clientID, trackChangeListener) {
    this.clientID = clientID;
    this.trackChangeListener = trackChangeListener;
    this.trackIDs = [];
    this.players = [];
    this.currentTrackIndex = 0;
  }

  init() {
    SC.initialize({
      client_id: this.clientID
    });

    this.getTrackIDs().then(() => {
      this.playTrack(this.currentTrackIndex);
    })

    this.bindUIControls();
  }

  // TODO: Handle case of URL being a track
  getTrackIDs() {
    return new SC.Promise((resolve, reject) => {
      SC.resolve('https://soundcloud.com/beshkenmusic/sets/closed-doors-ep').then((result) => {
        if (result && result.tracks) {
          for (let track of result.tracks) {
            this.trackIDs.push(track.id);
          }
          resolve();
        }
        reject();
      });
    })
  }

  playTrack(trackIndex) {
    let lastTrackIndex = this.currentTrackIndex;
    this.currentTrackIndex = trackIndex;
    if (this.players[trackIndex] && trackIndex == lastTrackIndex) {
      this.players[trackIndex].play();
      console.log("HEY");
      this.trackChangeListener(trackIndex);
    } else if (this.players[trackIndex]) {
      this.players[trackIndex].seek(0)
      this.players[trackIndex].play();
      console.log("HELLO");
      this.trackChangeListener(trackIndex);
    } else {
      let trackID = this.trackIDs[trackIndex];
      SC.stream('/tracks/' + trackID).then((player) => {
        if (player.options.protocols[0] === 'rtmp') {
          player.options.protocols.splice(0, 1);
        }
        this.players[trackIndex] = player;
        this.players[trackIndex].play();
        if (this.trackChangeListener) this.trackChangeListener(trackIndex);
        this.players[trackIndex].on('finish', (event) => {
          this.skipForward();
          if (!this.trackChangeListener) return;
          this.trackChangeListener(trackIndex);
        })
      });
    }
  }

  pauseTrack() {
    if (!this.players[this.currentTrackIndex]) return;
    this.players[this.currentTrackIndex].pause();
  }

  skipForward() {
    let nextTrack = (this.currentTrackIndex + 1) % this.trackIDs.length;
    this.playTrack(nextTrack);
  }

  skipBackward() {
    let nextTrack = this.currentTrackIndex == 0 ? this.trackIDs.length - 1 : this.currentTrackIndex - 1;
    this.trackChangeListener(nextTrack);
    this.playTrack(nextTrack);
  }

  bindUIControls() {
    document.getElementById('play').addEventListener('click', (event) => {
      event.preventDefault();
      this.playTrack(this.currentTrackIndex);
    });

    document.getElementById('pause').addEventListener('click', (event) => {
      event.preventDefault();
      this.pauseTrack();
    });

    document.getElementById('forward').addEventListener('click', (event) => {
      event.preventDefault();
      this.skipForward();
    })

    document.getElementById('backward').addEventListener('click', (event) => {
      event.preventDefault();
      this.skipBackward();
    })
  }
}
