# Haven Web App
Haven Web App is the front-end to [Haven Container Manager](https://github.com/codeabovelab/haven-platform). Please see the [Haven Readme](https://github.com/codeabovelab/haven-platform/blob/master/README.md) for the complete installation instruction and feature list.

## License

Copyright 2016-2017 Code Above Lab LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
## Developing Haven Web App

### Requirements

The minimum requirements are:

* node
* npm

### Installation

To install, run: 

`npm install`

### Development Mode

To start dev server - `./start.sh`

Then access it via [http://localhost:3000](http://localhost:3000)

### Production Mode

To run the webapp in production mode:

`npm run build`

Copy static files from `dist` to server.