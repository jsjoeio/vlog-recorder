NOTES

Video file is going to be too big. probably need to split in chunks.

Yes, it is possible to upload the video in chunks using the YouTube API. However, the process is a bit more complex than just making a series of fetch calls to upload the chunks.

The YouTube API supports chunked uploads, which allows you to upload the video in multiple parts. To use this feature, you would need to make an initial request to start the upload, and then send each chunk of the video in a separate request.

To implement this in your serverless function, you would need to:

Make an initial request to the YouTube API to start the upload. This can be done using the videos.insert method with the part parameter set to snippet and status. The response will include an uploadUrl property that you will use in the next step.

Divide the video file into chunks of your desired size. You mentioned that you have the video in memory in an array of chunks, so you can use that array to send each chunk to the YouTube API.

Send each chunk to the YouTube API using the videos.insert method with the part parameter set to none. For each chunk, you will need to set the Content-Type header to application/octet-stream, and include the chunk data in the request body. You will also need to include the uploadId and startOffset parameters in the query string of the request URL. The uploadId is the ID returned by the initial request, and the startOffset is the byte offset of the start of the chunk within the video file.

Once you have sent all the chunks, you will need to make a final request to the YouTube API to complete the upload. This can be done using the videos.update method with the part parameter set to status. In the request body, you will need to include the privacyStatus parameter to specify the privacy setting for the video.

Honestly might be easier to upload to like S3 then upload to YouTube then delete from S3.
