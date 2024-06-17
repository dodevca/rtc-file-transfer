document.addEventListener('DOMContentLoaded', () => {
    let fileArr     = [], fileSize = 0, fileName = '', receivedSize = 0, receivedBuffers = [], expiredIn
    const socket    = io()
    const icons     = [
        'aac', 'ai', 'bmp', 'cs', 'css', 'csv', 'doc', 'docx', 'exe', 'gif', 'heic', 'html', 'java', 'jpg', 'js', 'json', 'jsx', 'key', 'm4p', 'md', 'mdx', 'mov', 'mp3', 'mp4', 'otf', 'pdf', 'php', 'png', 'ppt', 'pptx', 'psd', 'py', 'raw', 'rb', 'sass', 'scss', 'sh', 'sql', 'svg', 'tiff', 'tsx', 'ttf', 'txt', 'wav', 'woff', 'xls', 'xlsx', 'xml', 'yml'
    ]
    const elements  = {
        dropArea            : document.getElementById('drop-area'),
        fileInput           : document.getElementById('file-input'),
        fileList            : document.getElementById('file-list'),
        fileCount           : document.getElementById('file-count'),
        fileWrap            : document.querySelector('#file-list .list-unstyled'),
        uploadBtn           : document.getElementById('upload-button'),
        addBtn              : document.getElementById('add-button'),
        resetBtn            : document.getElementById('reset-button'),
        sendBtn             : document.getElementById('send-button'),
        cancelBtn           : document.getElementById('cancel-button'),
        copyBtn             : document.getElementById('copy-button'),
        radioDirect         : document.getElementById('transfer-direct'),
        radioLink           : document.getElementById('transfer-link'),
        transferWrap        : document.getElementById('transfer-wrapper'),
        transferGenerate    : document.getElementById('transfer-generate'),
        transferProgress    : document.getElementById('transfer-progress'),
        transferTimer       : document.getElementById('transfer-timer'),
        qrCode              : document.getElementById('qr-code'),
        navSendTab          : document.getElementById('nav-send-tab'),
        navReceiveTab       : document.getElementById('nav-receive-tab'),
        navSend             : document.getElementById('nav-send'),
        navReceive          : document.getElementById('nav-receive'),
        uniqueCodeDisplay   : document.getElementById('unique-code-display'),
        uniqueCodeInput     : document.getElementById('unique-code-input'),
        downloadBtn         : document.getElementById('download-button'),
        senderProgress      : document.getElementById('sender-progress'),
        receiverProgress    : document.getElementById('receiver-progress'),
        senderInfo          : document.getElementById('sender-info'),
        receiverInfo        : document.getElementById('receiver-info'),
        alertModal          : document.getElementById('alert-modal')
    }

    const convertSize = (byte) => {
        let str = '0 B'

        if(byte < (1000 * 1000))
            str = `${(byte / 1000).toFixed(2)} KB`
        else if(byte < (1000 * 1000 * 1000))
            str = `${(byte / (1000 * 1000)).toFixed(2)} MB`
        else
            str = `${(byte / (1000 * 1000 * 1000)).toFixed(2)} GB`

        return str
    }
    
    const showAlert = (type, text, buttonText = "Done") => {
        const target        = new bootstrap.Modal(elements.alertModal, {
            keyboard: false
        })
        const content       = elements.alertModal.querySelector('.modal-content')
        const label         = elements.alertModal.querySelector('h5')
        const icon          = elements.alertModal.querySelector('h5 i')
        const message       = elements.alertModal.querySelector('p')
        const action        = elements.alertModal.querySelector('button')
        content.className   = label.className = icon.className = action.className = ''
        message.textContent = text
        action.textContent  = buttonText

        content.classList.add('modal-content', `bg-${type}-subtle`, 'border-0', 'shadow-lg', 'py-5')
        label.classList.add('display-1', `text-${type}`)
        icon.classList.add('bi', `bi-patch-${type == 'success' ? 'check' : type == 'warning' ? 'exclamation' : 'question'}-fill`)
        action.classList.add('btn', `btn-outline-${type}`, 'py-2')

        target.show()
    }

    const showElement = (element) => {
        element.classList.remove('d-none')
    }

    const hideElement = (element) => {
        element.classList.add('d-none')
    }

    const startCountDown = (duration) => {
        let timer = duration, minutes, seconds
        expiredIn = setInterval(() => {
            minutes                             = parseInt(timer / 60, 10)
            seconds                             = parseInt(timer % 60, 10)
            minutes                             = minutes < 10 ? "0" + minutes : minutes
            seconds                             = seconds < 10 ? "0" + seconds : seconds
            elements.transferTimer.textContent  = `${minutes}:${seconds}`
    
            if(--timer < 0) {
                if(elements.transferTimer.classList.contains('bg-secondary-subtle')) {
                    elements.transferTimer.classList.remove('bg-secondary-subtle')
                    elements.transferTimer.classList.add('bg-danger-subtle')
                }

                elements.transferTimer.textContent = 'Expired'
            }
        }, 1000, duration)
    }

    const resetCountDown = () => {
        clearInterval(expiredIn)

        if(elements.transferTimer.classList.contains('bg-danger-subtle')) {
            elements.transferTimer.classList.remove('bg-danger-subtle')
            elements.transferTimer.classList.add('bg-secondary-subtle')
        }

        elements.transferTimer.textContent = '05:00'
    }

    const progress = (element, value) => {
        value = value > 100 ? 100 : value

        element.setAttribute('aria-valuenow', value)
        element.querySelector('.progress-bar').style.width = `${value}%`
        element.querySelector('.progress-bar').textContent = `${value.toFixed(0)}%`

        if(value == 100)
            element.querySelector('.progress-bar').classList.add('bg-success-subtle')
        else
            element.querySelector('.progress-bar').classList.remove('bg-success-subtle')
    }

    const showList = (files) => {
        fileArr = fileArr.concat(Array.from(files))

        showElement(elements.fileList)
        hideElement(elements.dropArea)
        updateList()
    }

    const updateList = () => {
        elements.fileWrap.innerHTML = fileArr.map((file, index) => {
            const ext   = file.name.split('.').pop()
            const icon  = icons.includes(ext) ? `filetype-${ext}` : 'file-earmark'

            return `<li class="file d-flex align-items-center justify-content-between gap-3 py-3 border-bottom">
                <div class="d-flex align-items-center text-truncate gap-2">
                    <i class="text-light bi bi-${icon} fs-4"></i>
                    <h4 class="h6 text-truncate mb-0">${file.name}</h4>
                </div>
                <div class="d-flex align-items-center gap-2 ms-auto">
                    <span class="size text-light small">${convertSize(file.size)}</span>
                    <button type="button" class="cancel-button btn btn-link p-2" data-index="${index}">
                        <i class="bi bi-x-lg text-danger"></i>
                    </button>
                </div>
            </li>
        `}).join('')

        elements.fileWrap.querySelectorAll('.cancel-button').forEach(button => {
            button.addEventListener('click', (e) => {
                let index = e.currentTarget.getAttribute('data-index')

                fileArr.splice(index, 1)
                updateList()
            })
        })

        countFile()
    }

    const countFile = () => {
        const total                     = elements.fileWrap.children.length
		elements.fileCount.textContent  = `${total} ${total > 1 ? 'files' : 'file'}`
        elements.sendBtn.disabled       = elements.resetBtn.disabled = total === 0
    }

    const cancelTransfer = async() => {
        // await fetch('https://satset.dodevca.com/api/cancel', {
        //     method  : 'POST',
        //     body    : JSON.stringify({
        //         code: elements.uniqueCodeDisplay.value.trim()
        //     })  
        // })

        await fetch(`/api/cancel?code=${elements.uniqueCodeDisplay.value.trim()}`)
        
        fileArr                         = receivedBuffers = []
        fileSize                        = receivedSize = 0
        fileName                        = elements.senderInfo.textContent = elements.uniqueCodeDisplay.value = ''
        elements.qrCode.src             = '/images/qr-placeholder.png'
        elements.cancelBtn.innerHTML    = 'Cancel'
        elements.navSendTab.disabled    = elements.navReceiveTab.disabled = false
        
        if(elements.navReceive.querySelector('.alert') != null)
            elements.navReceive.querySelector('.alert').remove()

        resetCountDown(expiredIn)
        hideElement(elements.fileList)
        hideElement(elements.transferWrap)
        showElement(elements.dropArea)
        progress(elements.senderProgress, 0)
        updateList()
        countFile()

        socket.off('room-joined')
        socket.off('receiver-ready')
        socket.off('file-chunk-received')
        socket.off('file-info')
        socket.off('file-chunk')
        socket.off('receiver-complete')
    }

    const sendFile = async(file, code) => {
        let chunkSize   = 64 * 1024
        let offset      = 0

        showElement(elements.transferProgress)
        hideElement(elements.transferGenerate)
        socket.emit('file-info', { name: file.name, size: file.size, code: code })

        while(offset < file.size) {
            let chunk   = file.slice(offset, offset + chunkSize)
            let buffer  = await chunk.arrayBuffer()
            offset     += chunkSize

            socket.emit('file-chunk', { chunk: buffer, code })
        }

        elements.cancelBtn.disabled = false
    }

    const downloadBlob = () => {
        const blob  = new Blob(receivedBuffers)
        const url   = URL.createObjectURL(blob)
        const a     = document.createElement('a')
        a.href      = url
        a.download  = fileName

        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)  
    }

    elements.dropArea.addEventListener('dragover', (e) => {
        e.preventDefault()
        elements.dropArea.classList.add('active')
    })

    elements.dropArea.addEventListener('dragleave', () => {
        elements.dropArea.classList.remove('active')
    })

    elements.dropArea.addEventListener('drop', (e) => {
        e.preventDefault()
        elements.dropArea.classList.remove('active')
        showList(e.dataTransfer.files)
    })

    elements.uploadBtn.addEventListener('click', () => {
        elements.fileInput.click()
    })

    elements.addBtn.addEventListener('click', () => {
        elements.fileInput.click()
    })

    elements.resetBtn.addEventListener('click', () => {
        fileArr         = []
        receivedBuffers = []
        fileSize        = 0
        receivedSize    = 0
        fileName        = ''
        
        updateList()
        countFile()
    })

    elements.cancelBtn.addEventListener('click', async() => {
        cancelTransfer()
    })

    elements.copyBtn.addEventListener('click', () => {
        elements.uniqueCodeDisplay.select()
        document.execCommand("copy")
        showAlert('success', 'Unique code successfully copied')
    })

    elements.navSendTab.addEventListener('click', () => {
        if(receivedBuffers.length != 0 || receivedSize > 0)
            showAlert('warning', 'The transfer process was canceled because you moved to the sender tab.', 'Oke')

        cancelTransfer()
    })

    elements.navReceiveTab.addEventListener('click', () => {
        if(fileArr.length != 0)
            showAlert('warning', 'The transfer process was canceled because you moved to the receiver tab.', 'Oke')

        cancelTransfer()
    })

    elements.fileInput.addEventListener('change', (e) => {
        const files = e.target.files

        if(files.length > 0)
            showList(files)
    })

    elements.uniqueCodeInput.addEventListener('input', () => {
        elements.downloadBtn.disabled = elements.uniqueCodeInput.value === ''
    })

    elements.sendBtn.addEventListener('click', async() => {
        showElement(elements.transferWrap)
        hideElement(elements.fileList)

        if(elements.radioDirect.checked && fileArr.length > 0) {
            try {
                let uniqueCode = ''
                const generate = await fetch('/api/send')
                await generate.json()
                .then(async(response) => {
                    uniqueCode                          = response.code
                    elements.uniqueCodeDisplay.value    = uniqueCode
                    elements.qrCode.src                 = `https://image-charts.com/chart?chs=300x300&cht=qr&chl=https%3A%2F%2Fsatset.com%2F%3Fcode%3D${uniqueCode}&choe=UTF-8`
                    elements.navReceiveTab.disabled     = true
                    
                    showElement(elements.transferGenerate)
                    hideElement(elements.transferProgress)
                    startCountDown(5 * 60)
                })

                socket.emit('join-room', uniqueCode)

                if(fileArr.length > 1) {
                    const zip = new JSZip()

                    fileArr.forEach((file, index) => {
                        zip.file(file.name, file)
                    })

                    const zipContent    = await zip.generateAsync({ type: 'blob' })
                    fileArr             = [new File([zipContent], `${fileArr[0].name.substring(0, fileArr[0].name.lastIndexOf('.'))}-Satset.zip`, { type: "application/zip" })]
                }

                socket.on('receiver-ready', () => {
                    elements.senderInfo.innerHTML   = `Sending: ${fileArr[0].name}<br>Size: ${convertSize(fileArr[0].size)}`
                    elements.cancelBtn.innerHTML    = 'Send more'
                    elements.cancelBtn.disabled     = true

                    resetCountDown(expiredIn)
                    sendFile(fileArr[0], uniqueCode)
                })
                socket.on('file-chunk-received', (data) => {
                    progress(elements.senderProgress, data.receivedSize / fileArr[0].size * 100)

                    if(data.receivedSize >= fileArr[0].size) {
                        progress(elements.senderProgress, 100)
                        elements.navReceiveTab.disabled = false
                    }
                })
            } catch (error) {
                console.error('Error generating unique code:', error)
            }
        } else if(radioLink.checked && fileArr.length > 0) {
            // handle the link transfer logic here
        }
    })

    elements.downloadBtn.addEventListener('click', () => {
        const uniqueCode                    = elements.uniqueCodeInput.value.trim()
        elements.receiverInfo.textContent   = ''

        hideElement(elements.receiverProgress)
        progress(elements.receiverProgress, 0)
        socket.emit('join-room', uniqueCode)
        socket.on('room-joined', (data) => {
            if(data.success) {
                socket.emit('receiver-ready', uniqueCode)
            } else {
                if(elements.navReceive.querySelector('.alert') == null ) {
                    elements.navReceive.insertAdjacentHTML('afterbegin', `
                        <div class="alert alert-warning alert-dismissible fade show" role="alert">
                            ${data.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `)
                }
            }
        })
        socket.on('file-info', (data) => {
            fileName                        = data.name
            fileSize                        = data.size
            elements.receiverInfo.innerHTML = `Receiving: ${fileName}<br>Size: ${convertSize(fileSize)}`
            elements.uniqueCodeInput.value  = ''
            elements.downloadBtn.disabled   = true
            elements.navSendTab.disabled    = true
            
            showElement(elements.receiverProgress)
        })
        socket.on('file-chunk', (data) => {
            receivedSize += data.chunk.byteLength

            progress(elements.receiverProgress, receivedSize / fileSize * 100)
            receivedBuffers.push(data.chunk)
            socket.emit('file-chunk-received', { code: uniqueCode, receivedSize: receivedSize })

            if(receivedSize >= fileSize) {
                socket.emit('receiver-complete', uniqueCode)
                progress(elements.receiverProgress, 100)
                downloadBlob()
                cancelTransfer()
                
                elements.navSendTab.disabled = false
            }
        })
    })
})