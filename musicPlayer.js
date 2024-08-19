import songs from './assets/songsList/songs.js'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

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
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

audio.volume = 0.05

const app = {
    curIndex: 0,
    isPlaying: false,
    isSeeking: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs,
    setConfig: function(key,value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song,index) => {
            return`
                <div class="song ${index === this.curIndex ? 'active' : ''}" data-index="${index}">
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
            player.classList.add(`playing`)
            //rotate CD
            cdThumbAnimate.play()
        }
        //handle pause
        audio.onpause = function(){
            _this.isPlaying = false
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
            if(_this.isRandom){
                _this.playRandom()
            }else{
                _this.nextSong()
            }  
            audio.play()
        }
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandom()
            }else{
                _this.prevSong()
            }            
            audio.play()
        }

        //handle random next song
        //problem: make the posibility of next song equal
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom
            randomBtn.classList.toggle('active',_this.isRandom)

            //update state in local storage
            _this.setConfig('isRandom',_this.isRandom)
        }

        // next/ repeat song when the audio is finished
        //repeat song when finish
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            repeatBtn.classList.toggle('active',_this.isRepeat)

            //update state in local storage
            _this.setConfig('isRepeat',_this.isRepeat)
        }
        //next song when finish
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }

        //handle click to chose song
        playlist.onclick = function(e){
            //check if click in '.song' area
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                if(songNode){
                    _this.curIndex = songNode.getAttribute('data-index')
                    _this.loadCurSong()
                    audio.play()
                }
                if(e.target.closest('.option')){
                    
                }
            }
        }
    },
    scrollToActiveSong: function(){
        //bug: cant see element hidden by dashboard
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        },50)
    },
    loadCurSong: function(){
        heading.textContent = this.curSong.name
        cdThumb.style.backgroundImage = `url('${this.curSong.image}')`
        audio.src = this.curSong.path

        //add active class to curSong
        const prevActive = $('.song.active')
        if (prevActive) {
            prevActive.classList.remove('active')
        }
        const newActive = $(`.song[data-index="${this.curIndex}"]`)
        if (newActive) {
            newActive.classList.add('active')
        }
        //scroll To Active Song : scroll into view
        this.scrollToActiveSong()
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        //set config
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
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
    playRandom: function(){
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length) 
        } while (newIndex === this.currentIndex)
            this.curIndex = newIndex
        this.loadCurSong()
    },
    start: function(){
        //dinh nghia cac thuoc tinh cho obj
        this.defineProperties()

        //load the state of israndom, isrepeat
        this.loadConfig()

        this.handleEvents()
        
        this.loadCurSong()
        
        this.render()

        
    }
}
app.start()