# [MoneroExplorer](https://moneroexplorer.com)

MoneroExplorer allows you to monitor mempool and completete blocks on the Monero network.

### Open and Transparent

All of our work happens directly on [GitHub](https://github.com/MonerEcosystem/moneroexplorer.com). All pull requests by core team members and external contributors go through the same review process.

### Build and Run

#### Prerequisits

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/en/)

Get source code and download dependencies:

```
git clone https://github.com/MoneroEcosystem/moneroexplorer.com.git
cd MoneroExplorer
npm i
```

**Note**: For more information on how to install NPM modules globally on UNIX systems without resorting to sudo, refer to [this guide](http://www.johnpapa.net/how-to-use-npm-global-without-sudo-on-osx/).

#### Run

`npm run start`

This will run a local development server which default to http://localhost:8080

#### Build

`npm run build`

Generates a minified build in `./dist`

## License

MoneroExplorer is [MIT licensed](./LICENSE).
