import React, { Component } from 'react';

// gets the presigned post info from the server
function getPresignedPost(data = {}) {
    return fetch(`/getPresignedPost`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

// function to post to s3
function doSignedS3Post(url = '', formData = {}) {
    return fetch(url, {
        method: 'POST',
        body: formData
    });
}


export default class Uploader extends Component {
    constructor(props) {
        super(props);

        this.allowedMimeTypes = ['image/*', 'video/*'];
        this.fileInputRef = React.createRef();

        this.selectFiles = this.selectFiles.bind(this);
        this.createForm = this.createForm.bind(this);

    }

    // creates a form from the fields provided by the server
    createForm(fields, file) {
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => {
            formData.append(k, v);
        });
        formData.append("file", file);
        return formData;
    }

    selectFiles() {
        let files = this.fileInputRef.current.files;

        for (let i = 0; i < files.length; i++) {

            let fileParts = files[i].name.split('.');
            let fileInfo = {
                fileName: fileParts[0],
                fileType: fileParts[1]
            }

            getPresignedPost(fileInfo).then(res => {
                if (res.ok) {
                    res.json().then(resJson => {
                        console.log(resJson);
                        const { fields, url } = resJson;

                        let formData = this.createForm(fields, files[i]);
                        doSignedS3Post(url, formData).then(res => {
                            if (res.ok) {
                                alert(files[i].name + ' uploaded');
                            }
                            else {
                                res.text().then(text => {
                                    alert(text);
                                })
                            }
                        })
                    }).catch(err => console.log(err));
                }
                else {
                    console.log(res);
                }
            }).catch(err => console.log(err));
        }
    }

    render() {
        return (
            <React.Fragment>
                <p>Hello, Please Select File.</p>
                <input
                    ref={this.fileInputRef}
                    type="file"
                    accept={this.allowedMimeTypes}
                    multiple
                    onChange={this.selectFiles}
                />
            </React.Fragment>
        );
    }
}