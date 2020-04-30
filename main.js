const token   = process.env.SLACK_API_TOKEN;
const apikey  = process.env.LASTFM_API_KEY;
const secret  = process.env.LASTFM_SHARED_SECRET;
const user    = process.env.LASTFM_USER_NAME;

const electron   = require('electron');
const request    = require('request');
const LastFmNode = require('lastfm').LastFmNode;
const lastfm = new LastFmNode({
  api_key: apikey,
  secret:  secret,
});

const app = electron.app;

const sendToSlack = (message) => {
  request({
    url: 'https://slack.com/api/users.profile.set',
    method: 'POST',
    form: {
      token,
      profile: JSON.stringify({
        status_text:   message,
        status_emoji: ':musical_note:',
      }),
    },
  }, (error, response, body) => {
    if (!error) return;
    console.error(error, response, body);
  });
};

const watchLastfm = () => {
  let trackStream = lastfm.stream(user);
  trackStream.on('nowPlaying', function(track) {
    if (!track) return;
    const message = `${track.name} - ${track.artist['#text']}`;
    console.log(message);
    sendToSlack(message);
  });
  trackStream.start();
};

app.on('ready', () => {
  if (!token) {
    console.log('Slack Token ga naiyo');
    return;
  }
  if (!apikey) {
    console.log('Last.fm の API key ga naiyo');
    return;
  }
  if (!secret) {
    console.log('Last.fm の Shared secret ga naiyo');
    return;
  }
  if (!user) {
    console.log('Last.fm の Username ga naiyo');
    return;
  }

  watchLastfm();
});
