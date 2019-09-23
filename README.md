# Install & run #

### Install:

```
"npm install"
```

### Development: ###

```
npm run dev
```

### Production: ###
```
npm run build
```
Folder for production is: /dist/

### Sprites: ###
Sprites should be added to ```/src/images/sprites/icons/```

Sprites names should match ```sp-{spriteName}.png``` or ```sp-{spriteName}@2x.png``` for retina support

Then they can be used using ```@include sprite($sp-{spriteName});``` or ```@include retina-sprite($sp-{spriteName}-group);``` for retina sprites

### JS Features: ###
* Vue.js
* ES6

### CSS Features: ###
* Normalize