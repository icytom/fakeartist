# fakeartist

Multiplayer game based on "a fake artist goes to new york"

Uses socket.io on a node server.

Rules

Each round all players get shown the same word exept one who is shown nothing.

The players need to work together to draw the item.

All players then take turns to add a line to the drawing for 2 rounds

At the end everyone must guess who the fake artist is. 

if they guess wrong, the fake artist gets points.

if they guess right the fake artist gets to guess what was being drawn. 

If they guess what was being drawn they get points

If they don't know what is being drawn everyone else gets points.

i.e. you need to make sure all the real artists know that you know what is being drawn without revealing to the fake artist.

TODO

- [ ] each player is a different colour and lines are thicker
- [ ] start screen where players enter name and click when ready
- [ ] create room when everyone is ready
- [ ] random word list + acceptable answers
- [ ] put names next to colours
- [ ] timer and rounds
- [ ] end game
- [ ] scores