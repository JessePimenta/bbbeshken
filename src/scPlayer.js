import SC from 'soundcloud';

export default class SCPlayer {

  constructor(clientID, trackChangeListener, albumUrl, secret) {
    this.clientID = clientID;
    this.trackChangeListener = trackChangeListener;
    this.trackIDs = [];
    this.trackTitles = [];
    this.players = [];
    this.currentTrackIndex = 0;
    this.albumUrl = albumUrl;
    this.secret = secret || "";
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

  bindUIControls() {
    // document.getElementById('play').addEventListener('click', (event) => {
    //   event.preventDefault();
    //   this.playTrack(this.currentTrackIndex);
    // });
    //
    // document.getElementById('pause').addEventListener('click', (event) => {
    //   event.preventDefault();
    //   this.pauseTrack();
    // });

    document.getElementById('forward').addEventListener('click', (event) => {
      event.preventDefault();
      this.skipForward();
    })

    document.getElementById('backward').addEventListener('click', (event) => {
      event.preventDefault();
      this.skipBackward();
    })
  }

  // TODO: Handle case of URL being a track
  getTrackIDs() {
    return new SC.Promise((resolve, reject) => {
      SC.resolve(this.albumUrl).then((result) => {
        if (result && result.tracks) {
          for (let track of result.tracks) {
            console.log(track.title);
            this.trackTitles.push(track.title);
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

    if (this.players[trackIndex] && trackIndex == lastTrackIndex)
    {
      this.players[trackIndex].play();
      // this.trackChangeListener(trackIndex);
    }
    else if (this.players[trackIndex])
    {
      this.players[trackIndex].seek(0)
      this.players[trackIndex].play();
      // this.trackChangeListener(trackIndex);
    }
    else
    {
      let trackID = this.trackIDs[trackIndex];
      let trackTitle = this.trackTitles[trackIndex];

      SC.stream('/tracks/' + trackID, this.secret).then((player) => {
        // Chrome won't play with flash
        if (player.options.protocols[0] === 'rtmp') {
          player.options.protocols.splice(0, 1);
        }

        this.players[trackIndex] = player;

        this.players[trackIndex].on('play-start', (event) => {
          if (event.position == 0) this.trackChangeListener(trackIndex, trackTitle);
        })

        this.players[trackIndex].on('finish', (event) => {
          this.skipForward();
        })

        this.players[trackIndex].play();
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
    this.playTrack(nextTrack);
  }
}
