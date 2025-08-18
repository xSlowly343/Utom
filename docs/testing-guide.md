# 🧪 Руководство по тестированию системы

## 🎯 **Обзор системы тестирования**

Lost Ark Raid Manager включает в себя комплексную систему тестирования, состоящую из:

- **Test Manager** - ручное и выборочное тестирование
- **Auto Tester** - автоматическое тестирование в фоновом режиме
- **Performance Monitor** - мониторинг производительности
- **Интеграционные тесты** - проверка взаимодействия модулей

## 🚀 **Быстрый старт**

### **1. Запуск всех тестов**

```javascript
// Через консоль браузера
window.testManager.runAllTests();

// Или через интерфейс
// Нажмите кнопку "▶️ Запустить все тесты"
```

### **2. Запуск выбранных тестов**

```javascript
// Выберите нужные тесты в интерфейсе
// Нажмите кнопку "🎯 Выбранные тесты"
```

### **3. Автоматическое тестирование**

```javascript
// Включить автотестирование
window.autoTester.enable();

// Отключить автотестирование
window.autoTester.disable();

// Изменить интервал (в миллисекундах)
window.autoTester.setInterval(600000); // 10 минут
```

## 📋 **Тестовые наборы**

### **🗄️ База данных**
- Создание пользователей
- Получение и обновление данных
- Проверка подключения
- Тест транзакций

**Что тестируется:**
```javascript
// Создание пользователя
const userId = await databaseManager.createUser({
    username: 'test_user',
    email: 'test@example.com',
    role: 'user'
});

// Получение пользователя
const user = await databaseManager.getUserById(userId);

// Обновление пользователя
await databaseManager.updateUser(userId, { role: 'moderator' });
```

### **🌐 WebSocket**
- Подключение к серверу
- Отправка сообщений
- Проверка состояния соединения
- Тест переподключения

**Что тестируется:**
```javascript
// Проверка подключения
if (wsClient.isConnected) {
    // Тест отправки сообщения
    await wsClient.sendChatMessage('test', 'test message');
}
```

### **🔐 Аутентификация**
- Проверка статуса авторизации
- Получение текущего пользователя
- Проверка ролей и прав доступа

**Что тестируется:**
```javascript
// Проверка статуса
const isAuth = authManager.isUserAuthenticated();

// Получение пользователя
const currentUser = authManager.getCurrentUser();

// Проверка роли
const hasRole = authManager.hasRole('admin');
```

### **👤 Персонажи**
- Загрузка списка персонажей
- Создание нового персонажа
- Обновление данных персонажа
- Удаление персонажа

**Что тестируется:**
```javascript
// Загрузка персонажей
await charactersManager.loadCharacters();

// Создание персонажа
const characterId = await charactersManager.addCharacter({
    name: 'TestChar',
    class: 'Warrior',
    level: 50,
    itemLevel: 1500
});
```

### **⚔️ Рейды**
- Загрузка списка рейдов
- Создание нового рейда
- Управление участниками
- Обновление статуса рейда

**Что тестируется:**
```javascript
// Загрузка рейдов
await raidsManager.loadRaids();

// Создание рейда
const raidId = await raidsManager.createRaid({
    name: 'Test Raid',
    type: 'Legion',
    difficulty: 'Normal',
    date: '2024-01-01',
    time: '20:00',
    duration: 120,
    maxParticipants: 8,
    minItemLevel: 1500
});
```

### **💬 Чат**
- Инициализация WebSocket
- Переключение каналов
- Отправка сообщений
- Получение истории

**Что тестируется:**
```javascript
// Инициализация WebSocket
chatSystem.initializeWebSocket();

// Переключение каналов
chatSystem.switchChannel('general');
```

### **⚡ Производительность**
- Получение метрик
- Генерация отчетов
- Анализ производительности
- Рекомендации по оптимизации

**Что тестируется:**
```javascript
// Получение метрик
const metrics = performanceManager.getMetrics();

// Генерация отчета
const report = performanceManager.generateReport();
```

### **🔗 Интеграция**
- Проверка соединения с основным сайтом
- Тест миграции данных
- Синхронизация пользователей
- API интеграция

**Что тестируется:**
```javascript
// Проверка соединения с сайтом
const isConnected = await siteIntegrationManager.checkSiteConnection();

// Проверка миграции
const needsMigration = dataMigrationManager.needsMigration();
```

## 🔧 **Автоматическое тестирование**

### **Конфигурация**

```javascript
const config = {
    enabled: true,                    // Включено/выключено
    interval: 300000,                 // Интервал (5 минут)
    criticalTests: [                  // Критические тесты
        'database', 
        'websocket', 
        'authentication'
    ],
    warningThreshold: 0.8,            // Порог предупреждения (80%)
    criticalThreshold: 0.6,           // Критический порог (60%)
    maxRetries: 3,                    // Максимум попыток
    retryDelay: 60000                 // Задержка между попытками (1 мин)
};
```

### **Уведомления**

Auto Tester поддерживает несколько типов уведомлений:

- **Звуковые** - различные звуки для разных типов проблем
- **Desktop** - системные уведомления
- **Встроенные** - уведомления в интерфейсе приложения

### **Статусы системы**

- **✅ Здоров** - все тесты проходят успешно
- **⚠️ Предупреждение** - есть проблемы, но система работает
- **🚨 Критично** - серьезные проблемы, требуется вмешательство

## 📊 **Мониторинг и отчеты**

### **Получение статистики**

```javascript
// Статистика автотестирования
const stats = autoTester.getStatistics();
console.log(stats);
// {
//     totalTests: 150,
//     averageScore: 95.2,
//     successRate: 98.7,
//     last24Hours: 12
// }

// История тестов
const history = autoTester.getTestHistory(20); // Последние 20 тестов

// Текущий статус
const status = autoTester.getStatus();
```

### **Экспорт результатов**

```javascript
// Экспорт результатов тестирования
testManager.exportResults();

// Экспорт отчета о производительности
performanceManager.generateReport();
```

## 🛠️ **Настройка и кастомизация**

### **Добавление новых тестов**

```javascript
// В TestManager добавьте новый тест
async testNewFeature() {
    this.logTest('Тестирование новой функции...', 'info');
    
    try {
        // Ваш тест
        const result = await someFunction();
        
        if (result.success) {
            this.testResults.passed++;
            this.logTest('✅ Новая функция: OK', 'success');
        } else {
            throw new Error('Функция не работает');
        }
        
    } catch (error) {
        this.testResults.failed++;
        this.logTest(`❌ Новая функция: ${error.message}`, 'error');
    }
    
    this.testResults.total++;
}

// Добавьте в testSuites
this.testSuites = {
    // ... существующие тесты
    newFeature: this.testNewFeature.bind(this)
};
```

### **Настройка порогов**

```javascript
// Изменение порогов производительности
performanceManager.setThreshold('maxResponseTime', 2000); // 2 секунды
performanceManager.setThreshold('maxQueryTime', 1000);   // 1 секунда
performanceManager.setThreshold('maxMemoryUsage', 0.9);  // 90%

// Включение/выключение оптимизаций
performanceManager.setOptimization('messageBatching', true);
performanceManager.setOptimization('queryCaching', false);
```

### **Кастомизация уведомлений**

```javascript
// Настройка уведомлений автотестирования
autoTester.notifications = {
    enabled: true,
    sound: true,
    desktop: true
};

// Изменение интервала автотестирования
autoTester.setInterval(600000); // 10 минут
```

## 🚨 **Устранение неполадок**

### **Частые проблемы**

#### **1. Тесты не запускаются**

```javascript
// Проверьте доступность TestManager
if (window.testManager) {
    console.log('TestManager доступен');
} else {
    console.error('TestManager не найден');
}

// Проверьте консоль на ошибки
console.error('Проверьте ошибки в консоли');
```

#### **2. Автотестирование не работает**

```javascript
// Проверьте статус
const status = autoTester.getStatus();
console.log('Статус автотестирования:', status);

// Включите заново
autoTester.enable();

// Проверьте конфигурацию
console.log('Конфигурация:', autoTester.config);
```

#### **3. Ошибки в тестах базы данных**

```javascript
// Проверьте подключение к БД
if (window.databaseManager) {
    try {
        const stats = await databaseManager.getStats();
        console.log('БД работает:', stats);
    } catch (error) {
        console.error('Ошибка БД:', error);
    }
}
```

#### **4. WebSocket тесты падают**

```javascript
// Проверьте состояние WebSocket
if (window.wsClient) {
    console.log('WebSocket статус:', wsClient.isConnected);
    
    // Попробуйте переподключиться
    if (!wsClient.isConnected) {
        await wsClient.connect();
    }
}
```

### **Логи и отладка**

```javascript
// Включение подробного логирования
localStorage.setItem('debugMode', 'true');

// Просмотр логов тестирования
const testLog = document.getElementById('testLog');
console.log('Лог тестирования:', testLog.innerHTML);

// Проверка истории автотестирования
const history = autoTester.getTestHistory();
console.log('История автотестирования:', history);
```

## 📈 **Метрики и KPI**

### **Ключевые показатели**

- **Успешность тестов** - процент прошедших тестов
- **Время выполнения** - среднее время выполнения тестов
- **Доступность системы** - время работы без критических ошибок
- **Производительность** - время ответа и использование ресурсов

### **Целевые значения**

- **Успешность тестов**: > 95%
- **Время ответа WebSocket**: < 1000ms
- **Время запросов к БД**: < 500ms
- **Использование памяти**: < 80%
- **Доступность системы**: > 99.9%

## 🔄 **Интеграция с CI/CD**

### **Автоматизация тестирования**

```bash
# Запуск тестов в headless режиме
npm run test:headless

# Запуск тестов производительности
npm run test:performance

# Генерация отчетов
npm run test:report
```

### **Webhook интеграция**

```javascript
// Отправка результатов в внешнюю систему
async function sendResultsToCI(results) {
    try {
        const response = await fetch('https://ci.example.com/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN'
            },
            body: JSON.stringify({
                project: 'lost-ark-manager',
                results: results,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            console.log('Результаты отправлены в CI');
        }
    } catch (error) {
        console.error('Ошибка отправки в CI:', error);
    }
}
```

## 📚 **Дополнительные ресурсы**

### **Документация**

- [PostgreSQL Setup Guide](../docs/postgresql-setup.md)
- [Performance Monitoring](../docs/performance-guide.md)
- [API Reference](../docs/api-reference.md)

### **Примеры кода**

- [Test Examples](../examples/testing/)
- [Performance Tests](../examples/performance/)
- [Integration Tests](../examples/integration/)

### **Инструменты**

- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Postman](https://www.postman.com/) - для API тестирования
- [JMeter](https://jmeter.apache.org/) - для нагрузочного тестирования

---

**💡 Совет**: Регулярно запускайте автоматическое тестирование для раннего выявления проблем и поддержания высокого качества системы.