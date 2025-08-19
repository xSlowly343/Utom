# 🧪 Руководство по тестированию Lost Ark Raid Manager

## 📋 Обзор системы тестирования

Приложение включает комплексную систему автоматизированного тестирования, состоящую из:

- **TestManager** - Основной менеджер тестов
- **TestRunner** - Интерфейс выполнения тестов
- **Автоматическое тестирование** - Фоновые проверки
- **5 типов тестов** - Unit, Integration, Performance, Accessibility, UI

## 🚀 Быстрый старт

### Запуск всех тестов
```javascript
// Через UI Demo
window.uiDemo.runAllTests();

// Напрямую
window.testRunner.runAllTests();

// Через события
window.dispatchEvent(new CustomEvent('test:runAll'));
```

### Запуск конкретного типа тестов
```javascript
// Unit тесты
window.testRunner.runUnitTests();

// Integration тесты
window.testRunner.runIntegrationTests();

// Performance тесты
window.testRunner.runPerformanceTests();

// Accessibility тесты
window.testRunner.runAccessibilityTests();

// UI тесты
window.testRunner.runUITests();
```

## 🧪 Типы тестов

### 1. Unit Tests (Модульные тесты)
Тестируют отдельные компоненты приложения в изоляции.

**Включают:**
- Database Connection
- Authentication
- WebSocket Connection
- Local Storage
- Event System

**Запуск:**
```javascript
window.testRunner.runUnitTests();
```

### 2. Integration Tests (Интеграционные тесты)
Тестируют взаимодействие между модулями.

**Включают:**
- Module Communication
- Data Flow
- State Management
- Error Handling
- Performance Monitoring

**Запуск:**
```javascript
window.testRunner.runIntegrationTests();
```

### 3. Performance Tests (Тесты производительности)
Проверяют производительность и эффективность.

**Включают:**
- Memory Usage
- Response Time
- Animation Performance
- Database Performance
- UI Responsiveness

**Запуск:**
```javascript
window.testRunner.runPerformanceTests();
```

### 4. Accessibility Tests (Тесты доступности)
Проверяют соответствие стандартам доступности.

**Включают:**
- ARIA Labels
- Keyboard Navigation
- Focus Management
- Color Contrast
- Screen Reader Support

**Запуск:**
```javascript
window.testRunner.runAccessibilityTests();
```

### 5. UI Tests (Тесты интерфейса)
Проверяют корректность пользовательского интерфейса.

**Включают:**
- Component Rendering
- Responsive Design
- Animation System
- Theme Switching
- Form Validation

**Запуск:**
```javascript
window.testRunner.runUITests();
```

## 🎯 Автоматическое тестирование

### Настройки автоматизации
```javascript
// Получение настроек
const settings = window.testManager.settings;

// Обновление настроек
window.testManager.updateSettings({
    enableAutoTesting: true,
    testInterval: 30000, // 30 секунд
    maxTestDuration: 10000, // 10 секунд
    retryAttempts: 3
});
```

### Критические тесты
Автоматически запускаются каждые 30 секунд:
- Database Connection
- Authentication
- Event System

### Мониторинг производительности
- **Memory Usage** - каждые 10 секунд
- **Animation Performance** - при запуске анимаций
- **UI Responsiveness** - при взаимодействии

## 📊 Результаты тестирования

### Получение результатов
```javascript
// Все результаты
const allResults = window.testManager.getTestResults();

// Результаты конкретного suite
const unitResults = window.testManager.getTestResults('unit');

// История тестов
const history = window.testManager.getTestHistory();

// Неудачные тесты
const failedTests = window.testManager.getFailedTests();
```

### Структура результатов
```javascript
{
    total: 25,
    passed: 23,
    failed: 2,
    skipped: 0,
    duration: 1500,
    suites: [
        {
            suiteId: 'unit',
            suiteName: 'Unit Tests',
            total: 5,
            passed: 5,
            failed: 0,
            duration: 300,
            tests: [
                {
                    name: 'Database Connection',
                    status: 'passed',
                    duration: 50,
                    timestamp: 1234567890
                }
            ]
        }
    ]
}
```

## 🔧 Настройка тестирования

### Конфигурация TestManager
```javascript
const testManager = window.testManager;

// Включение/отключение типов тестов
testManager.updateSettings({
    enableUnitTests: true,
    enableIntegrationTests: true,
    enablePerformanceTests: true,
    enableAccessibilityTests: true,
    enableUITests: true
});

// Настройка автоматизации
testManager.updateSettings({
    enableAutoTesting: true,
    testInterval: 60000, // 1 минута
    maxTestDuration: 15000, // 15 секунд
    retryAttempts: 5
});
```

### Настройка уведомлений
```javascript
testManager.updateSettings({
    showTestNotifications: true,
    logTestResults: true
});
```

## 📱 Интерфейс тестирования

### Test Runner UI
```javascript
// Показать интерфейс
window.testRunner.showReport();

// Скрыть интерфейс
window.testRunner.hideReport();

// Проверить статус
const isRunning = window.testRunner.isTestRunning();
const currentRun = window.testRunner.getCurrentRun();
```

### Элементы интерфейса
- **Progress Bar** - Прогресс выполнения
- **Test Results** - Детальные результаты
- **Test Actions** - Кнопки запуска тестов
- **Suite Results** - Результаты по группам
- **Error Details** - Детали ошибок

## 🚨 Обработка ошибок

### Типы ошибок
1. **Test Timeout** - Превышение времени выполнения
2. **Module Not Found** - Модуль недоступен
3. **Connection Failed** - Ошибка подключения
4. **Validation Failed** - Ошибка валидации
5. **Performance Issue** - Проблема производительности

### Логирование ошибок
```javascript
// Все неудачные тесты
const failedTests = window.testManager.getFailedTests();

// Детали конкретной ошибки
const testError = failedTests.find(test => test.name === 'Database Connection');
console.log('Error:', testError.error);
console.log('Last Failure:', testError.lastFailure);
console.log('Failure Count:', testError.failureCount);
```

## 🔄 События тестирования

### Слушатели событий
```javascript
// Запуск всех тестов
window.addEventListener('test:runAll', () => {
    console.log('Запущены все тесты');
});

// Запуск конкретного suite
window.addEventListener('test:runSuite', (event) => {
    const { suiteId } = event.detail;
    console.log(`Запущен suite: ${suiteId}`);
});

// Результаты тестов
window.addEventListener('test:results', (event) => {
    const { results } = event.detail;
    console.log('Результаты:', results);
});
```

### Отправка событий
```javascript
// Запуск тестов
window.dispatchEvent(new CustomEvent('test:runAll'));
window.dispatchEvent(new CustomEvent('test:runSuite', { 
    detail: { suiteId: 'unit' } 
}));

// Результаты
window.dispatchEvent(new CustomEvent('test:results', { 
    detail: { results: testResults } 
}));
```

## 📈 Мониторинг и метрики

### Метрики производительности
```javascript
// Использование памяти
if (performance.memory) {
    const memory = performance.memory;
    const usage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    console.log(`Memory usage: ${usage.toFixed(1)}%`);
}

// Время отклика
const startTime = performance.now();
// ... операция ...
const endTime = performance.now();
const responseTime = endTime - startTime;
```

### Статистика тестов
```javascript
const testSuites = window.testManager.getTestSuites();

testSuites.forEach(suite => {
    console.log(`${suite.name}:`);
    console.log(`  Total runs: ${suite.totalRuns}`);
    console.log(`  Success rate: ${((suite.successCount / (suite.successCount + suite.failureCount)) * 100).toFixed(1)}%`);
    console.log(`  Last run: ${new Date(suite.lastRun).toLocaleString()}`);
});
```

## 🛠️ Расширение системы тестирования

### Добавление нового test suite
```javascript
window.testManager.addTestSuite('custom', {
    name: 'Custom Tests',
    description: 'Пользовательские тесты',
    tests: [
        {
            name: 'Custom Test 1',
            test: async () => {
                // Логика теста
                if (someCondition) {
                    throw new Error('Test failed');
                }
            }
        }
    ]
});
```

### Добавление теста в существующий suite
```javascript
const suite = window.testManager.testSuites.get('unit');
if (suite) {
    suite.tests.push({
        name: 'New Unit Test',
        test: async () => {
            // Логика теста
        }
    });
}
```

### Создание пользовательского теста
```javascript
class CustomTest {
    constructor(name, testFunction) {
        this.name = name;
        this.test = testFunction;
    }
}

const customTest = new CustomTest('My Test', async () => {
    // Логика теста
    return true;
});

// Добавление в suite
const suite = window.testManager.testSuites.get('unit');
if (suite) {
    suite.tests.push(customTest);
}
```

## 🔍 Отладка тестов

### Включение детального логирования
```javascript
// В консоли браузера
localStorage.setItem('testManagerSettings', JSON.stringify({
    logTestResults: true,
    showTestNotifications: true
}));

// Перезапуск TestManager
window.testManager.restart();
```

### Проверка состояния модулей
```javascript
// Проверка доступности TestManager
console.log('TestManager:', window.testManager);

// Проверка доступности TestRunner
console.log('TestRunner:', window.testRunner);

// Проверка настроек
console.log('Settings:', window.testManager.settings);

// Проверка test suites
console.log('Test Suites:', window.testManager.getTestSuites());
```

### Анализ неудачных тестов
```javascript
const failedTests = window.testManager.getFailedTests();

failedTests.forEach(test => {
    console.group(`Failed Test: ${test.name}`);
    console.log('Error:', test.error);
    console.log('Last Failure:', new Date(test.lastFailure).toLocaleString());
    console.log('Failure Count:', test.failureCount);
    console.groupEnd();
});
```

## 📚 Лучшие практики

### 1. Структура тестов
- Каждый тест должен быть независимым
- Тесты должны быть быстрыми (< 10 секунд)
- Используйте описательные имена тестов
- Группируйте связанные тесты в suites

### 2. Обработка ошибок
- Всегда проверяйте доступность модулей
- Используйте try-catch для критических операций
- Логируйте детали ошибок
- Предоставляйте понятные сообщения об ошибках

### 3. Производительность
- Избегайте тяжелых операций в тестах
- Используйте моки для внешних зависимостей
- Очищайте ресурсы после тестов
- Мониторьте использование памяти

### 4. Доступность
- Тестируйте keyboard navigation
- Проверяйте ARIA labels
- Тестируйте screen reader support
- Проверяйте color contrast

## 🚀 Следующие шаги

После освоения базового тестирования:

1. **Создание пользовательских тестов** для специфичных функций
2. **Интеграция с CI/CD** для автоматического тестирования
3. **Настройка уведомлений** для критических ошибок
4. **Расширение метрик** для детального мониторинга
5. **Создание тестовых данных** для различных сценариев

## 📞 Поддержка

При возникновении проблем с тестированием:

1. Проверьте консоль браузера на наличие ошибок
2. Убедитесь, что все модули инициализированы
3. Проверьте настройки TestManager
4. Используйте методы отладки из этого руководства

---

**Happy Testing! 🧪✨**