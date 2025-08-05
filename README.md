# Game of Life on a Toroidal Surface

Conway game of life simulation on surface of a torus.  



## Geometry


At core it maps a 2D grid to torus surface coordinates by first calculating radial coordinates then converting to position vector using torus parameterization 


Next important part is cell surface orientation by calculating surface normal and tangent vector.

The project uses threejs for creating 3D torus, cell meshes and dynamic camera view. 


## Devolopment

The project uses vite. Run the following commands to get it running locally.  


```sh
git clone git@github.com:rankdim/torus.git
cd torus
npm install
npm run dev
```

## Contributing

There's big scope for optimizations and many low hanging fruits  
Currently the grid size is manually adjusted to make the cell segment closer to square, we should be able to calculate it automatically.
Your can also contribute interesting patterns.  

## License

[MIT](LICENSE)
