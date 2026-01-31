// Google Apps Script Code
// 1. Create a new Google App Script project
// 2. Paste this code
// 3. Deploy as "Web App" -> "Execute as: Me", "Who has access: Anyone"

function doPost(e) {
  try {
    const data = e.parameter.data;
    const filename = e.parameter.filename || "image.png";
    const mimeType = e.parameter.mimetype || "image/png";
    
    // Convert base64 to blob
    const blob = Utilities.newBlob(Utilities.base64Decode(data), mimeType, filename);
    
    // Save to Drive (ROOT or specific folder)
    // To save to a specific folder: DriveApp.getFolderById("YOUR_FOLDER_ID").createFile(blob);
    const file = DriveApp.createFile(blob);
    
    // Make public so it can be viewed in the album
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return the direct download/view URL
    // Note: 'view' URL works better for images in img tags than 'preview'
    const fileId = file.getId();
    const directUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      url: directUrl,
      fileId: fileId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
