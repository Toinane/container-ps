# Container PS
This little app for **OSX** help you to manager your Docker containers.
It uses shell commands using the **Node.js** *child_process* [exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) module.

---

You can see the list of all your containers, whether they are active or not.
![Screenshot](/screenshots/dark.png)

With the light Theme.
![Screenshot](/screenshots/light.png)

- The full circle indicates that the container is active.
- The empty circle indicates that it is inactive.
- And the round with a full wave indicates that the container is restarting.

![Screenshot](/screenshots/light-complete.png)
When hovering over a container, you will have additional information about it, as well as buttons to turn it on, off, restart or delete it.

---

## Download

Since exec from child_process doesn't work in asar archive, I can't make a release for the moment :/
If you have a solution for this, feel free to contribute!

### Launch in shell
```shell
    yarn && yarn start
```