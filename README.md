# Container PS
> This little app for **OSX** help you to manager your Docker containers.

You must have Docker launched to make work this app.
It uses shell commands using the **Node.js** *child_process* [spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) module, thanks to @SebastianRuecker.

---

You can see the list of all your containers, whether they are active or not.

<img src="https://raw.githubusercontent.com/Toinane/container-ps/master/screenshots/dark.png" style="width: 70%">

With the light Theme.

<img src="https://raw.githubusercontent.com/Toinane/container-ps/master/screenshots/light.png" style="width: 70%">

- The full circle indicates that the container is active.
- The empty circle indicates that it is inactive.
- And the round with a full wave indicates that the container is restarting.

When hovering over a container, you will have additional information about it, as well as buttons to turn it on, off, restart or delete it.

---

# Download

See in [releases pages](https://github.com/Toinane/container-ps/releases).

# Development

Install dependencies and start.
```shell
    yarn && yarn start
```