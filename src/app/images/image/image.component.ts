import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from "rxjs/operators";
import { ImageService } from 'src/app/shared/image.service';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styles: []
})
export class ImageComponent implements OnInit {
  imgSrc: string;
  selectedImage: any = null;
  selectedImages: any[] = [];
  isSubmitted: boolean;

  formTemplate = new FormGroup({
    caption: new FormControl('', Validators.required),
    category: new FormControl(''),
    imageUrl: new FormControl('', Validators.required)
  })

  constructor(private storage: AngularFireStorage, private service: ImageService) { }

  ngOnInit() {
    this.resetForm();
  }

  showPreview(event: any) {
    if (event.target.files) {
      console.log(event.target.files.length)
      for(var i=0; i<event.target.files.length; i++){
         const reader = new FileReader();
         reader.onload = (e: any) => this.imgSrc = e.target.result;
         reader.readAsDataURL(event.target.files[i]);
         this.selectedImages.push(event.target.files[i]);
         console.log(this.selectedImages)
      }
    }
    else {
      this.imgSrc = '/assets/img/image_placeholder.jpg';
      this.selectedImages = [];
    }
    // console.log(this.selectedImage.length)
  }

  onSubmit(formValue) {
    console.log(this.selectedImages.length)
    console.log('onSubmit')
    this.isSubmitted = true;
    if (this.formTemplate.valid) {
      for(var y=0; y<this.selectedImages.length; y++){
        var filePath = `${formValue.category}/${this.selectedImages[y].name.split('.').slice(0, -1).join('.')}_${new Date().getTime()}`;
        console.log(filePath)
        const fileRef = this.storage.ref(filePath);
        this.storage.upload(filePath, this.selectedImages[y]).snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              console.log(url)
              formValue['imageUrl'] = url;
              this.service.insertImageDetails(formValue);
              this.resetForm();
            })
          })
        ).subscribe();
      }
      
    }
  }

  get formControls() {
    return this.formTemplate['controls'];
  }

  resetForm() {
    this.formTemplate.reset();
    this.formTemplate.setValue({
      caption: '',
      imageUrl: '',
      category: 'Animal'
    });
    this.imgSrc = '/assets/img/image_placeholder.jpg';
    this.selectedImage = null;
    this.isSubmitted = false;
  }

}
