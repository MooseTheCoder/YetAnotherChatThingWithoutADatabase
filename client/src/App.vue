<template>
  <div id="app" ref="app">
    <router-view/>
  </div>
</template>

<script>
export default{
	mounted(){
		const appHeight = () => {
			const doc = document.documentElement
			doc.style.setProperty('--app-height', `${window.innerHeight}px`)
		}
		
		window.addEventListener('resize', appHeight)
		appHeight()
	}
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Poppins:300,400,500,600&display=swap');
*{
	font-family: 'Poppins',sans-serif;
}
html, body {
	padding: 0px;
	margin: 0px;
}

:root {
   --app-height: 100%;
}

.app{
	min-height: -moz-available; /* WebKit-based browsers will ignore this. */
	min-height: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
	min-height: fill-available;
}
*:fullscreen, *:-webkit-full-screen, *:-moz-full-screen {
    background-color: white
}
</style>
