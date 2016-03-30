<?php 
	//裁剪后图片尺寸
	//$targ_w = $targ_h = 150;
	$targ_w = $_POST['tarW'];//目标图片宽度
	$targ_h = $_POST['tarH'];//目标图片高度
	$jpeg_quality = 90;//范围从 0（最差质量，文件更小）到 100（最佳质量，文件最大）

	$src = $_POST['src'];//得到服务器图片路径
	$names = explode('/', $src);
	$name = $names[count($names)-1];//得到图片名字
	$new_path = "cropImages/".date('YmdHis').$name;//生成新路径，并以时间戳更改图片名字
	$img_r = imagecreatefromjpeg($src);// 由 URL 创建一个新图象
	$dst_r = ImageCreateTrueColor( $targ_w, $targ_h );//生成幅大小为 $targ_w 和 $targ_h 的黑色图像
	//将上传图像裁剪并等比例缩放为固定尺寸
	imagecopyresampled($dst_r,$img_r,0,0,$_POST['x'],$_POST['y'],$targ_w,$targ_h,$_POST['w'],$_POST['h']);
	
	header('Content-type: image/jpeg');
	//从 $dst_r 图像以 $new_path 为文件名创建一个 质量为 $jpeg_quality 的 JPEG 图像。
	imagejpeg($dst_r,$new_path,$jpeg_quality);
	//返回新路径
	echo json_encode(array(
	   'src' => $new_path
	));
	//exit;
?>