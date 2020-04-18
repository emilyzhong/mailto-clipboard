

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == "shownotification")
    chrome.notifications.create({
      type: "basic",
      title: "Email copied!",
      message: `Email ${request.email} has been copied to your clipboard.`,
      iconUrl: "../../icons/icon16.png"
    });
    sendResponse()
  }
);
