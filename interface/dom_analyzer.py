from selenium.webdriver.common.by import By

class DOMAnalyzer:
    def __init__(self, driver):
        self.driver = driver

    def get_text(self, selector):
        try:
            return self.driver.find_element(By.CSS_SELECTOR, selector).text
        except:
            return None

    def get_number(self, selector):
        text = self.get_text(selector)
        try:
            return float(text)
        except:
            return 0.0

    def click(self, selector):
        try:
            self.driver.find_element(By.CSS_SELECTOR, selector).click()
        except:
            pass
