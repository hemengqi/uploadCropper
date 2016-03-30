<?php
 $files = array();
  $success = 0; //用户统计有多少张图片上传成功了  
  foreach ($_FILES as $item) {
   $index = count($files);
 
   $files[$index]['srcName'] = $item['name']; //上传图片的原名字
   $files[$index]['error'] = $item['error']; //和该文件上传相关的错误代码
   $files[$index]['size'] = $item['size'];  //已上传文件的大小，单位为字节
   $files[$index]['type'] = $item['type'];  //文件的 MIME 类型，需要浏览器提供该信息的支持，例如"image/gif"
   $files[$index]['success'] = false;   //这个用于标志该图片是否上传成功
   $files[$index]['path'] = '';    //存图片路径
 
   // 接收过程有没有错误
   if($item['error'] != 0) continue;
   //判断图片能不能上传
   if(!is_uploaded_file($item['tmp_name'])) {
    $files[$index]['error'] = 8000;
    continue;
   }
   //扩展名
   $extension = '';
   if(strcmp($item['type'], 'image/jpeg') == 0) {
    $extension = '.jpg';

   
   
 
     //对临时文件名加密，用于后面生成复杂的新文件名
     $md5 = md5_file($item['tmp_name']);
     //取得图片的大小
     $imageInfo = getimagesize($item['tmp_name']);
     $rawImageWidth = $imageInfo[0];
     $rawImageHeight = $imageInfo[1];
     $currentTime = date('YmdHis');
   
     //设置图片上传路径，放在upload文件夹，以年月日生成文件夹分类存储，
     //文件名
     $name = "$md5.0x{$rawImageWidth}x{$rawImageHeight}{$extension}";
     //$name = "$md5.0{$extension}";
     //加入图片文件没变化到，也就是存在，就不必重复上传了，不存在则上传

      $upload_dir = "upload/".date("Ymd").'/';

      $abs_upload_dir = dirname(__FILE__).'/'.$upload_dir;

      !is_dir($abs_upload_dir) && mkdir($abs_upload_dir);
      
      $file_path = $abs_upload_dir.$name;
      
      $short_filename = $upload_dir.$name;

     $ret = file_exists($file_path) ? true : move_uploaded_file($item['tmp_name'],$file_path);
     if($ret === false) {
      $files[$index]['error'] = 8004;
      continue;
     }
     else {
      $files[$index]['path'] = $short_filename;  //存图片路径
      $files[$index]['success'] = true;   //图片上传成功标志
      $files[$index]['width'] = $rawImageWidth; //图片宽度
      $files[$index]['height'] = $rawImageHeight; //图片高度
      $success ++; //成功+1
     }
   }
  }
 
  //将图片已json形式返回给js处理页面 ，这里大家可以改成自己的json返回处理代码
  echo json_encode(array(
   'total' => count($files),
   'success' => $success,
   'files' => $files,
  ));
?>
