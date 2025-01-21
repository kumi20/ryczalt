import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import typescript from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DocumentationAgent {
  /**
   * Główna funkcja dodająca dokumentację do pliku
   * @param filePath - Ścieżka do pliku który ma być udokumentowany
   */
  public static addDocumentation(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const sourceFile = typescript.createSourceFile(
      filePath,
      fileContent,
      typescript.ScriptTarget.ES2022,
      true
    );

    let updatedContent = fileContent;
    const methodsToDocument = this.findMethodsToDocument(sourceFile);

    for (const method of methodsToDocument.reverse()) {
      const documentation = this.generateDocumentation(method);
      updatedContent = this.insertDocumentation(updatedContent, method.pos, documentation);
    }

    fs.writeFileSync(filePath, updatedContent);
  }/**
 * Metoda findMethodsToDocument
 * Funkcja odpowiedzialna za findmethodstodocument
 *
 * @param sourceFile - (typescript.Node) Parametr sourceFile
 * @returns Wartość zwracana przez findMethodsToDocument
 */
/**
 * Metoda findMethodsToDocument
 * @param sourceFile - (typescript.Node) Parametr sourceFile
 * @returns Wartość zwracana przez findMethodsToDocument
 */
/**
 * Metoda findMethodsToDocument
 * @param sourceFile - Parametr sourceFile
 * @returns Wartość zwracana przez findMethodsToDocument
 */


  /**
   * Znajduje wszystkie metody w pliku które wymagają dokumentacji
   */
  private static findMethodsToDocument(sourceFile: typescript.Node): typescript.MethodDeclaration[] {
    const methods: typescript.MethodDeclaration[] = [];

    const visit = (node: typescript.Node): void => {
      if (typescript.isMethodDeclaration(node) && !this.hasJSDoc(node)) {
        methods.push(node);
      }
      typescript.forEachChild(node, visit);
    };

    visit(sourceFile);
    return methods;
  }/**
 * Metoda generateDocumentation
 * Funkcja odpowiedzialna za generatedocumentation
 *
 * @param method - (typescript.MethodDeclaration) Parametr method
 * @returns Wartość zwracana przez generateDocumentation
 */
/**
 * Metoda generateDocumentation
 * @param method - (typescript.MethodDeclaration) Parametr method
 * @returns Wartość zwracana przez generateDocumentation
 */
/**
 * Metoda generateDocumentation
 * @param method - Parametr method
 * @returns Wartość zwracana przez generateDocumentation
 */


  /**
   * Generuje dokumentację dla metody
   */
  private static generateDocumentation(method: typescript.MethodDeclaration): string {
    const methodName = method.name.getText();
    const parameters = method.parameters;
    const returnType = method.type;

    let doc = `/**\n`;
    doc += ` * ${this.generateDescription(methodName)}\n`;
    doc += ` * ${this.generateFunctionDescription(methodName, method)}\n`;
    doc += ` *\n`;

    parameters.forEach(param => {
      const paramName = param.name.getText();
      const paramType = param.type ? param.type.getText() : 'any';
      doc += ` * @param ${paramName} - (${paramType}) ${this.generateParamDescription(paramName)}\n`;
    });

    if (returnType) {
      doc += ` * @returns ${this.generateReturnDescription(methodName)}\n`;
    }

    doc += ` */\n`;
    return doc;
  }/**
 * Metoda generateDescription
 * Funkcja odpowiedzialna za generatedescription
 *
 * @param methodName - (string) Parametr methodName
 * @returns Wartość zwracana przez generateDescription
 */
/**
 * Metoda generateDescription
 * @param methodName - (string) Parametr methodName
 * @returns Wartość zwracana przez generateDescription
 */
/**
 * Metoda generateDescription
 * @param methodName - Parametr methodName
 * @returns Wartość zwracana przez generateDescription
 */


  /**
   * Generuje opis metody na podstawie jej nazwy
   */
  private static generateDescription(methodName: string): string {
    return `Metoda ${methodName}`;
  }/**
 * Metoda generateParamDescription
 * Funkcja odpowiedzialna za generateparamdescription
 *
 * @param paramName - (string) Parametr paramName
 * @returns Wartość zwracana przez generateParamDescription
 */
/**
 * Metoda generateParamDescription
 * @param paramName - (string) Parametr paramName
 * @returns Wartość zwracana przez generateParamDescription
 */
/**
 * Metoda generateParamDescription
 * @param paramName - Parametr paramName
 * @returns Wartość zwracana przez generateParamDescription
 */


  /**
   * Generuje opis parametru
   */
  private static generateParamDescription(paramName: string): string {
    return `Parametr ${paramName}`;
  }/**
 * Metoda generateReturnDescription
 * Funkcja odpowiedzialna za generatereturndescription
 *
 * @param methodName - (string) Parametr methodName
 * @returns Wartość zwracana przez generateReturnDescription
 */
/**
 * Metoda generateReturnDescription
 * @param methodName - (string) Parametr methodName
 * @returns Wartość zwracana przez generateReturnDescription
 */
/**
 * Metoda generateReturnDescription
 * @param methodName - Parametr methodName
 * @returns Wartość zwracana przez generateReturnDescription
 */


  /**
   * Generuje opis zwracanej wartości
   */
  private static generateReturnDescription(methodName: string): string {
    return `Wartość zwracana przez ${methodName}`;
  }/**
 * Metoda hasJSDoc
 * Sprawdza czy posiada jsdoc
 *
 * @param node - (typescript.Node) Parametr node
 * @returns Wartość zwracana przez hasJSDoc
 */
/**
 * Metoda hasJSDoc
 * @param node - (typescript.Node) Parametr node
 * @returns Wartość zwracana przez hasJSDoc
 */
/**
 * Metoda hasJSDoc
 * @param node - Parametr node
 * @returns Wartość zwracana przez hasJSDoc
 */


  /**
   * Sprawdza czy metoda ma już dokumentację
   */
  private static hasJSDoc(node: typescript.Node): boolean {
    return typescript.getJSDocTags(node).length > 0;
  }/**
 * Metoda insertDocumentation
 * Funkcja odpowiedzialna za insertdocumentation
 *
 * @param content - (string) Parametr content
 * @param position - (number) Parametr position
 * @param documentation - (string) Parametr documentation
 * @returns Wartość zwracana przez insertDocumentation
 */
/**
 * Metoda insertDocumentation
 * @param content - (string) Parametr content
 * @param position - (number) Parametr position
 * @param documentation - (string) Parametr documentation
 * @returns Wartość zwracana przez insertDocumentation
 */
/**
 * Metoda insertDocumentation
 * @param content - Parametr content
 * @param position - Parametr position
 * @param documentation - Parametr documentation
 * @returns Wartość zwracana przez insertDocumentation
 */


  /**
   * Wstawia dokumentację do kodu
   */
  private static insertDocumentation(content: string, position: number, documentation: string): string {
    return content.slice(0, position) + documentation + content.slice(position);
  }

  /**
   * Generuje opis funkcjonalności metody
   * @param methodName - (string) Nazwa metody
   * @param method - (typescript.MethodDeclaration) Deklaracja metody
   * @returns Opis funkcjonalności
   */
  private static generateFunctionDescription(methodName: string, method: typescript.MethodDeclaration): string {
    // Analizujemy nazwę metody i jej strukturę, aby wygenerować sensowny opis
    if (methodName.startsWith('get')) {
      return `Pobiera ${methodName.substring(3).toLowerCase()}`;
    }
    if (methodName.startsWith('set')) {
      return `Ustawia ${methodName.substring(3).toLowerCase()}`;
    }
    if (methodName.startsWith('add')) {
      return `Dodaje ${methodName.substring(3).toLowerCase()}`;
    }
    if (methodName.startsWith('delete') || methodName.startsWith('remove')) {
      return `Usuwa ${methodName.substring(6).toLowerCase()}`;
    }
    if (methodName.startsWith('update')) {
      return `Aktualizuje ${methodName.substring(6).toLowerCase()}`;
    }
    if (methodName.startsWith('is')) {
      return `Sprawdza czy ${methodName.substring(2).toLowerCase()}`;
    }
    if (methodName.startsWith('has')) {
      return `Sprawdza czy posiada ${methodName.substring(3).toLowerCase()}`;
    }
    if (methodName.startsWith('on')) {
      return `Obsługuje zdarzenie ${methodName.substring(2).toLowerCase()}`;
    }
    if (methodName === 'ngOnInit') {
      return 'Inicjalizuje komponent';
    }
    if (methodName === 'ngOnDestroy') {
      return 'Zwalnia zasoby przy niszczeniu komponentu';
    }
    if (methodName === 'ngAfterViewInit') {
      return 'Inicjalizuje widok po załadowaniu komponentu';
    }
    if (methodName === 'constructor') {
      return 'Konstruktor klasy';
    }

    // Jeśli nie znaleźliśmy specyficznego wzorca, generujemy ogólny opis
    return `Funkcja odpowiedzialna za ${methodName.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}`;
  }
}
