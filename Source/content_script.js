function walk(rootNode) {
  // Find all the text nodes in rootNode
  var walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    null,
    false
  ),
  node;

  // Modify each text node's value
  while (node = walker.nextNode()) {
    handleText(node);
  }
}

function handleText(textNode) {
  textNode.nodeValue = replaceText(textNode.nodeValue);
}

function replaceText(v) {

  // Impeachment
  v = v.replace(/\bIMPEACHMENT\b/g, "INVESTIGATION");
  v = v.replace(/\bImpeachment\b/g, "Investigation");
  v = v.replace(/\bimpeachment\b/g, "investigation");

  // Impeach
  v = v.replace(/\bIMPEACH\b/g, "INVESTIGATE");
  v = v.replace(/\bImpeach\b/g, "Investigate");
  v = v.replace(/\bimpeach\b/g, "investigate");

  // Impeached
  v = v.replace(/\bIMPEACHED\b/g, "INVESTIGATED");
  v = v.replace(/\bImpeached\b/g, "Investigated");
  v = v.replace(/\bimpeached\b/g, "investigated");

  // Impeaching
  v = v.replace(/\bIMPEACHING\b/g, "INVESTIGATING");
  v = v.replace(/\bImpeaching\b/g, "Investigating");
  v = v.replace(/\bimpeaching\b/g, "investigating");

  // Other
  v = v.replace(/\bNO COLLUSION\b/g, "COLLUSION");
  v = v.replace(/\bNo Collusion\b/g, "Collusion");
  v = v.replace(/\bno collusion\b/g, "collusion");
  v = v.replace(/\bPRESIDENTIAL HARASSMENT\b/g, "CONGRESSIONAL OVERSIGHT");
  v = v.replace(/\bSen(.?|ator) McConnell\b/g, "Moscow Mitch");
  v = v.replace(/\bMitch McConnell\b/g, "Moscow Mitch");
  v = v.replace(/\b(Crooked|Lyin'|Leakin'|Liddle') (Hillary|Comey|Adam|Bob)\b/g, "Honorable $2");

  return v;
}

// Returns true if a node should *not* be altered in any way
function isForbiddenNode(node) {
  return node.isContentEditable || // DraftJS and many others
  (node.parentNode && node.parentNode.isContentEditable) || // Special case for Gmail
  (node.tagName && (node.tagName.toLowerCase() == "textarea" || // Some catch-alls
    node.tagName.toLowerCase() == "input"));
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
  var i, node;

  mutations.forEach(function(mutation) {
    for (i = 0; i < mutation.addedNodes.length; i++) {
      node = mutation.addedNodes[i];
      if (isForbiddenNode(node)) {
        // Should never operate on user-editable content
        continue;
      } else if (node.nodeType === 3) {
        // Replace the text for text nodes
        handleText(node);
      } else {
        // Otherwise, find text nodes within the given node and replace text
        walk(node);
      }
    }
  });
}

// Walk the doc (document) body, replace the title, and observe the body and title
function walkAndObserve(doc) {
  var docTitle = doc.getElementsByTagName('title')[0],
    observerConfig = {
      characterData: true,
      childList: true,
      subtree: true
    },
    bodyObserver,
    titleObserver;

  // Do the initial text replacements in the document body and title
  walk(doc.body);
  doc.title = replaceText(doc.title);

  // Observe the body so that we replace text in any added/modified nodes
  bodyObserver = new MutationObserver(observerCallback);
  bodyObserver.observe(doc.body, observerConfig);

  // Observe the title so we can handle any modifications there
  if (docTitle) {
    titleObserver = new MutationObserver(observerCallback);
    titleObserver.observe(docTitle, observerConfig);
  }
}

walkAndObserve(document);
