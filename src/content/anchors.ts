import { DOMLocator } from '../shared/types';

export function getXPathForNode(node: Node): string {
  if (node.nodeType === Node.DOCUMENT_NODE) {
    return '/';
  }

  const parent = node.parentNode;
  if (!parent) {
    return '';
  }

  const parentPath = getXPathForNode(parent);
  
  if (node.nodeType === Node.TEXT_NODE) {
    const siblings = Array.from(parent.childNodes);
    const index = siblings.filter(n => n.nodeType === Node.TEXT_NODE)
      .indexOf(node as ChildNode) + 1;
    return `${parentPath}/text()[${index}]`;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter(
      el => el.tagName.toLowerCase() === tagName
    );
    const index = siblings.indexOf(element) + 1;
    return `${parentPath}/${tagName}[${index}]`;
  }

  return parentPath;
}

export function getNodeFromXPath(xpath: string): Node | null {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue;
  } catch (error) {
    console.error('Error evaluating XPath:', error);
    return null;
  }
}

export function serializeRange(range: Range): DOMLocator {
  const startXPath = getXPathForNode(range.startContainer);
  const endXPath = getXPathForNode(range.endContainer);
  const textSnippet = range.toString();

  return {
    startXPath,
    endXPath,
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    textSnippet,
  };
}

export function deserializeRange(locator: DOMLocator): Range | null {
  try {
    const startNode = getNodeFromXPath(locator.startXPath);
    const endNode = getNodeFromXPath(locator.endXPath);

    if (!startNode || !endNode) {
      return fuzzySearchRange(locator.textSnippet);
    }

    const range = document.createRange();
    range.setStart(startNode, locator.startOffset);
    range.setEnd(endNode, locator.endOffset);

    // Verify the text matches
    if (range.toString() === locator.textSnippet) {
      return range;
    }

    // Fallback to fuzzy search
    return fuzzySearchRange(locator.textSnippet);
  } catch (error) {
    console.error('Error deserializing range:', error);
    return fuzzySearchRange(locator.textSnippet);
  }
}

export function fuzzySearchRange(textSnippet: string): Range | null {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes: Text[] = [];
  let node: Node | null;
  
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  // Try to find exact match first
  for (let i = 0; i < textNodes.length; i++) {
    const startNode = textNodes[i];
    const startText = startNode.textContent || '';
    
    if (startText.includes(textSnippet)) {
      const startOffset = startText.indexOf(textSnippet);
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(startNode, startOffset + textSnippet.length);
      return range;
    }
  }

  // Try to find across multiple nodes
  let accumulatedText = '';
  let startNode: Text | null = null;
  let startOffset = 0;

  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const nodeText = node.textContent || '';
    
    if (!startNode) {
      const index = nodeText.indexOf(textSnippet.charAt(0));
      if (index >= 0) {
        startNode = node;
        startOffset = index;
        accumulatedText = nodeText.substring(index);
      }
    } else {
      accumulatedText += nodeText;
    }

    if (startNode && accumulatedText.includes(textSnippet)) {
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      
      // Find end position
      let remainingLength = textSnippet.length;
      
      for (let j = textNodes.indexOf(startNode); j < textNodes.length; j++) {
        const n = textNodes[j];
        const availableLength = (n.textContent?.length || 0) - (j === textNodes.indexOf(startNode) ? startOffset : 0);
        
        if (remainingLength <= availableLength) {
          range.setEnd(n, (j === textNodes.indexOf(startNode) ? startOffset : 0) + remainingLength);
          return range;
        }
        
        remainingLength -= availableLength;
      }
    }
  }

  return null;
}
