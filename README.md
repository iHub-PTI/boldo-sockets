# Boldo - Sockets Server

Boldo can be found in any Paraguayan household. It is a magic team that can calm all kind of stomache ache.

This is the sockets.IO (websocktes) server for Boldo - a telemedicine solution for doctors and patients.
The sockets server facilitates realtime communication between web app and mobile app.

## Getting Started

1. This project has the following dependencies:

   - node.js (v12 or newer)
   - Optional Dependency:
     - Docker (v19 or newer) for building the image

2. Install dependencies: `npm i`

3. Create a `.env` with the following content:

   ```
   PUBLIC_KEY = RSA256 Public Key from boldo-server (e.g. `-----BEGIN PUBLIC KEY-----\nMI...`)
   VERBOSE = true or false - to print connection logs
   ```

4. `npm run dev` - to start server on [localhost:8000](http://localhost:8000)

## Run with docker

To build the docker image use the following command:

```
docker build -t boldo-sockets .
```

Remember to set your `.env` file.

After that you can test it running the following command:

```bash
docker run --rm -it -p 8000:8000 boldo-sockets
```

## Limitations

This server does currently use local memory to store sockets and rooms. Therefore it is not possible to scale this server by adding more nodes. If that is needed, REDIS can be added as a socket storage.

## Contributing

The project is currently under heavy development but contributors are welcome. For bugs or feature requests or eventual contributions, just open an issue. Contribution guidelines will be available shortly.

## Authors and License

This project was created as part of the iHub COVID-19 project in collaboration between [Penguin Academy](https://penguin.academy) and [PTI (Parque Tecnológico Itaipu Paraguay)](http://pti.org.py).

This project is licensed under
[AGPL v3](LICENSE)
