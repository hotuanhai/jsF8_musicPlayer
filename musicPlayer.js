import songs from './assets/songsList/songs.js'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const player = $('.player')
const playlist = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')

const app = {
    curIndex: 0,
    isPlaying: false,
    isSeeking: false,
    songs,
    render: function(){
        const htmls = this.songs.map(function(song){
            return`
                <div class="song">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function(){
        Object.defineProperty(this,'curSong',{
            get : function(){
                return this.songs[this.curIndex]
            }
        })
    },
    handleEvents: function(){
        const _this = this

        //rotate CD when play / stop
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 50000,
            iteration: Infinity 
        })
        cdThumbAnimate.pause()

        //set width,height of cd img when scrolling
        const cdWidth = cd.offsetWidth
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCDWidth = cdWidth - scrollTop/3
            cd.style.width = newCDWidth > 0 ? newCDWidth + 'px' : 0
            cd.style.opacity = newCDWidth/cdWidth
        }
        // handle pause / play btn
        playBtn.onclick = function(){
            if(_this.isPlaying){            
                audio.pause()
            }else{           
                audio.play()
            }
        }

        //handle play
        audio.onplay = function(){
            _this.isPlaying = true
            audio.volume = 0.1
            player.classList.add(`playing`)
            //rotate CD
            cdThumbAnimate.play()
        }
        //handle pause
        audio.onpause = function(){
            _this.isPlaying = false
            audio.volume = 0.1
            player.classList.remove(`playing`)
            //rotate CD
            cdThumbAnimate.pause()
        }
        // update the progress bar 
        audio.ontimeupdate = function(){
            if(!_this.isSeeking && audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100)
                progress.value = progressPercent
            }
        }
        //tua
        //isSeeking to handle confict of oninput-onchange and ontimeupdate
        progress.oninput = function(e) {
            _this.isSeeking = true; 
        }
        progress.onchange = function(e) {
            const seekTime = e.target.value / 100 * audio.duration;
            audio.currentTime = seekTime;
            _this.isSeeking = false; // 
        }
        
        //handle next/prev btn
        nextBtn.onclick = function(){
            _this.nextSong()
            audio.play()
        }
        prevBtn.onclick = function(){
            _this.prevSong()
            audio.play()
        }
    },
    loadCurSong: function(){
        heading.textContent = this.curSong.name
        cdThumb.style.backgroundImage = `url('${this.curSong.image}')`
        audio.src = this.curSong.path
    },
    nextSong: function () {
        this.curIndex++
        if(this.curIndex >= this.songs.length){
            this.curIndex = 0
        }
        this.loadCurSong()
    },
    prevSong: function () {
        this.curIndex--
        if(this.curIndex < 0 ){
            this.curIndex = this.songs.length - 1
        }
        this.loadCurSong()
    },
    start: function(){
        //dinh nghia cac thuoc tinh cho obj
        this.defineProperties()

        this.handleEvents()
        
        this.loadCurSong()
        
        this.render()
    }
}
app.start()