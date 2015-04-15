module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		//Define paths
		js_dist_path:'public/assets/js',
		css_dist_path:'public/assets/css',
		app_build_path:'public/app/',
        components_build_path:'public/app/components/',
        shared_build_path:'public/app/shared/',
		

         ngAnnotate: {
	        derp: {
	            files: [
	                {
	                    expand: true,
	                    src: ['<%=app_build_path%>/**/*.js'],
	                    dest:'<%=js_dist_path%>',
	                    ext: '.annotated.js', // Dest filepaths will have this extension.
	                    extDot: 'last',       // Extensions in filenames begin after the last dot
	                    flatten: true
	                }
	            ]
	        }
	    },

	    uglify:{
	    	dynamic:{
	    		files:[{
				  expand: true,
				  cwd: '<%=js_dist_path%>',
				  src: ['*.js','!*.min.js'],
				  dest: '<%=js_dist_path%>',
				  ext: '.min.js',
				  extDot: 'last',
				  flatten: true
				}]
	    	}
	    },


		less: {
	      build: {
	        files:[{
			  expand: true,
			  cwd: '<%=components_build_path%>',
			  src: ['**/*.less'],
			  dest: '<%=css_dist_path%>',
			  ext: '.css',
			  flatten: true
			},{
			  expand: true,
			  cwd: '<%=shared_build_path%>',
			  src: ['**/*.less'],
			  dest: '<%=css_dist_path%>',
			  ext: '.css',
			  flatten: true
			}]
	      }
	    },


	    concat:{
	    	js:{
	    		files:[{
				  src: ['<%=js_dist_path%>/*.min.js','!<%=js_dist_path%>/*.concat.min.js'],
				  dest: '<%=js_dist_path%>/rainbow-trailBuilt.concat.min.js'
				}]
	    	},
	    	css:{
	    		files:[{
	    			src:['<%=css_dist_path%>/*.css'],
	    			dest:'<%=css_dist_path%>/rainbow-trailStyle.concat.css'
	    		}]
	    	}
	    },

	    watch: {
	      css: {
	        files: ['<%=components_build_path%>/**/*.less','<%=shared_build_path%>/**/*.less'],
	        tasks: ['less','concat:css']
	      },
	      js:{
	      	files: ['<%=app_build_path%>/**/*.js'],
	      	tasks: ['ngAnnotate','uglify','concat:js']
	      }
	    },

	    nodemon:{
			dev:{
				script:'server.js'
			}
		},

	    concurrent: {
	      options: {
	        logConcurrentOutput: true
	      },
	      tasks: ['nodemon', 'watch']
	    }  

	});
	
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	
	grunt.registerTask('default',['less','ngAnnotate','uglify','concat','concurrent']);
	grunt.registerTask('dev',['less','concurrent']);
};