// foounit.require(':spec/spec-helper');

// Include your source file here
foounit.require('/epiceditor/js/epiceditor')

function _getIframeInnards(el) {
  return el.contentDocument || el.contentWindow.document;
}

function _createTestElement(){
  var testEl = document.createElement('div')
    , testId = 'epiceditor-'+(new Date().getTime())+'-'+(Math.round(Math.random()*1000))
  testEl.id = testId;
  document.body.appendChild(testEl);
  return testId;
}

describe('EpicEditor.load', function () {

  var testEl = _createTestElement()
    , editor = new EpicEditor({ basePath: '/epiceditor/', container: testEl })
    , editorIframe
    , editorInnards
    , wasLoaded = false;

  editor.on('load',function(){
    wasLoaded = this;
  });

  editor.load();

  it('check if EE returns an object reference',function(){
    expect(typeof editor).to(be,'object');
  });


  it('make sure the load event was fired',function(){
    expect(typeof wasLoaded).to(be,'object');
  });

  describe('check if the DOM is in place',function(){

    editorIframe = document.getElementById(testEl).getElementsByTagName('iframe');
    editorInnards = _getIframeInnards(editorIframe[0]);

    it('make sure there\'s one wrapping iframe',function(){ 
      expect(editorIframe.length).to(be,1);
    });
    
    it('make sure there\'s two inner iframes',function(){ 
      expect(editorInnards.getElementsByTagName('iframe').length).to(be,2);
    });

    it('check to make sure the editor frame exists', function(){
      expect(editorInnards.getElementById('epiceditor-editor-frame')).toNot(beNull);
    });

    it('check to make sure the previewer frame exists', function(){
      expect(editorInnards.getElementById('epiceditor-previewer-frame')).toNot(beNull);
    });

    it('check to make sure the utility bar exists', function(){
      // This really needs to be an ID, and when it changes, should check for null and not undefined
      expect(editorInnards.getElementsByClassName('epiceditor-utilbar')[0]).toNot(beUndefined);
    });
  });
});

describe('EpicEditor.getElement',function(){

  var testEl = _createTestElement()
    , editor = new EpicEditor({ basePath: '/epiceditor/', container: testEl }).load()
    , wrapperIframe
    , innerWrapper;

  before(function(){
    wrapperIframe = document.getElementById(testEl).getElementsByTagName('iframe')[0];
    innerWrapper = _getIframeInnards(wrapperIframe);
  });

  it('check that "container" is the element given at setup', function(){
    expect(editor.getElement('container')).to(be, document.getElementById(testEl));
  });

  it('check that the "wrapper" is the div inside the wrapping iframe containing the other two iframes', function(){
    innerWrapperDiv = innerWrapper.getElementById('epiceditor-wrapper');
    expect(editor.getElement('wrapper')).to(be, innerWrapperDiv);
  });

  it('check that the "wrapperIframe" is the iframe containing the other two iframes', function(){
    expect(editor.getElement('wrapperIframe')).to(be, wrapperIframe);
  });

  it('check that "editor" is #document of the editor iframe', function(){
    expect(editor.getElement('editor')).to(be, _getIframeInnards(innerWrapper.getElementById('epiceditor-editor-frame')));
  });

  it('check that "editorIframe" is <iframe> containing the editor', function(){
    expect(editor.getElement('editorIframe').id).to(be,'epiceditor-editor-frame');
  });

  it('check that "previewer" is #document of the previewer iframe', function(){
    expect(editor.getElement('previewer')).to(be, _getIframeInnards(innerWrapper.getElementById('epiceditor-previewer-frame')));
  });

  it('check that "previewerIframe" is <iframe> containing the previewer', function(){
    expect(editor.getElement('previewerIframe').id).to(be,'epiceditor-previewer-frame');
  });
});



describe('EpicEditor.open', function(){

  var testEl = _createTestElement()
    , editor = new EpicEditor({ basePath: '/epiceditor/', container: testEl }).load();


  editor.importFile('openMeLater', 'open me later').importFile('openMe', 'open this file');

  it('check that the openMe file was created successfully', function(){
    expect(editor.exportFile('openMe')).to(be,'open this file');
  });

  it('check that the openMeLater file was created successfully', function(){
    expect(editor.exportFile('openMeLater')).to(be,'open me later');
  });
  
  it('check that the file is open in the editor', function(){
    expect(editor.getElement('editor').body.innerHTML).to(be,'open this file');
  });

  it('check that openMeLater opens into the editor after calling .open', function(){
    editor.open('openMeLater');
    expect(editor.getElement('editor').body.innerHTML).to(be,'open me later');
  });

});

describe('EpicEditor.importFile', function(){

  var testEl = _createTestElement()
    , editor = new EpicEditor({ basePath: '/epiceditor/', container: testEl }).load();

  it('check that the content is currently blank', function(){
    expect(editor.exportFile()).to(be,'');
  });

  it('check that importFile(\'foo\',\'#bar\') is imported and can be received', function(){
    editor.importFile(testEl,'#bar');
    expect(editor.exportFile()).to(be,'#bar');
  });
  
  // TODO: Tests for importFile's kind parameter when implemented
  // TODO: Tests for importFile's meta parameter when implemented

});

describe('EpicEditor.exportFile', function(){
  var testEl = _createTestElement()
    , contents
    , editor = new EpicEditor({
        basePath: '/epiceditor/'
      , file:{
          defaultContent: '#foo\n\n##bar'
        }
      , container: testEl
    }).load();


  it('check that exportFile will work without parameters by outputting the current file as raw text', function(){
    contents = editor.exportFile();
    expect(contents).to(be,'#foo\n\n##bar');
  });

  it('check that exportFile will export the current file as HTML with a null parameter as it\'s first', function(){
    contents = editor.exportFile(null, 'html');
    expect(contents).to(be,'<h1>foo</h1>\n<h2>bar</h2>\n');
  });

  it('check that exporting a file that doesn\'t exist returns as undefined', function(){
    contents = editor.exportFile('poop');
    expect(contents).to(beUndefined);
  });

  it('check that export file can open non-currently open files', function(){
    editor.importFile('exportFileTest', 'hello world');
    expect(editor.exportFile('exportFileTest')).to(be,'hello world');
  });
});

describe('EpicEditor.rename', function(){
  var testEl = _createTestElement()
    , editor = new EpicEditor({ basePath: '/epiceditor/', container: testEl }).load();

  editor.importFile('foo', 'testing...');

  it('check to see if the foo file exists before trying to rename', function(){
    expect(editor.exportFile('foo')).to(be,'testing...');
  });

  it('check that renaming a file actually renames the file', function(){
    editor.rename('foo','bar');
    expect(editor.exportFile('bar')).to(be,'testing...');
  });

  it('check that foo no longer exists', function(){
    expect(editor.exportFile('foo')).to(beUndefined);
  });
});


describe('EpicEditor.remove', function(){
  var testEl = _createTestElement()
    , editor = new EpicEditor({ basePath: '/epiceditor/', container: testEl }).load();
  
  editor.importFile('removeMe','hello world').importFile('dontRemoveMe','foo bar');

  it('check that the foo file was imported', function(){
    expect(editor.exportFile('removeMe')).to(be,'hello world');
  });

  it('check that after removing the file exportFile returns false', function(){
    editor.remove('removeMe');
    expect(editor.exportFile('removeMe')).to(beUndefined);
  });

  it('check that other files weren\'t removed', function(){
    expect(editor.exportFile('dontRemoveMe')).to(be,'foo bar');
  });
});

describe('EpicEditor.load.options', function(){

});

describe('EpicEditor.edit', function(){

});

describe('EpicEditor.preview', function(){
  
});

describe('EpicEditor.unload', function(){

});

describe('EpicEditor.save', function(){

});

describe('EpicEditor.on', function(){

});

describe('EpicEditor.emit', function(){

});

describe('EpicEditor.removeListener', function(){

});
/*
describe('When the editor is unloaded', function(){

  // This shit has to be cleaned up
  var testDOM = document.createElement('div');
  testDOM.id = 'unload-test';
  document.body.appendChild(testDOM);

  var editor = new EpicEditor({ basePath:'/epiceditor/', container:'unload-test' })
    , editorWrapper = document.getElementById('unload-test')
    , wasLoaded = false
    , wasUnloaded = false;
  
  editor.on('load',function(){
    wasLoaded = true;
  });

  editor.on('unload', function(){
    wasUnloaded = true;
  });

  editor.load();

  it('check if it was actually loaded first', function(){
    expect(wasLoaded).to(beTrue);
  });    

  editor.unload();

  it('check if the is no longer an iframe inside the wrapper', function(){
    expect(editorWrapper.getElementsByTagName('iframe').length).to(be,0);    
  });
  
  it('check if the unload event was fired', function(){
    expect(wasUnloaded).to(beTrue);
  });
});*/