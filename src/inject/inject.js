// This is from https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
const copyToClipboard = str => {
	const el = document.createElement('textarea');  // Create a <textarea> element
	el.value = str;                                 // Set its value to the string that you want copied
	el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
	el.style.position = 'absolute';                 
	el.style.left = '-9999px';                      // Move outside the screen to make it invisible
	document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
	const selected =            
		document.getSelection().rangeCount > 0        // Check if there is any content selected previously
			? document.getSelection().getRangeAt(0)     // Store selection if found
			: false;                                    // Mark as false to know no selection existed before
	el.select();                                    // Select the <textarea> content
	document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
	document.body.removeChild(el);                  // Remove the <textarea> element
	if (selected) {                                 // If a selection existed before copying
		document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
		document.getSelection().addRange(selected);   // Restore the original selection
	}
};

const modifyLink = (linkNode) => {
	const regex = /^[^?]+@[^?]+/g
	let href = linkNode.getAttribute("href")
	if (href) {
		href = href.trim()
		if (href.slice(0, 7) == "mailto:") {
			const noMailTo = href.slice(7)
			const email = noMailTo.match(regex)
			if (email) {
				linkNode.onclick = (e) => {
					e.preventDefault()
					copyToClipboard(email[0])
					chrome.runtime.sendMessage({
						type: "shownotification",
						email: email[0],
					}, function() { return true });
				}
			}
		}
	}
}

const callback = (mutationsList, observer) => {
	for (let mutation of mutationsList) {
		if (mutation.type === 'childList') {
			Array.from(mutation.addedNodes).forEach(node => {
				if (node.tagName == 'A') {
					modifyLink(node)
				} else {
					const links = node.getElementsByTagName && node.getElementsByTagName('a')
					if (links) {
						for (let i = 0; i < links.length; i++) {
							modifyLink(links[i])
						}
					}
				}
			})
		}
	}
}

const observer = new MutationObserver(callback);
observer.observe(document.body, { childList: true, subtree: true })

document.onload = () => {
	const links = document.getElementsByTagName("a")
	Array.from(links).forEach(link => {
		modifyLink(link)
	})
}

window.onbeforeunload = () => {
	observer.disconnect();
}

