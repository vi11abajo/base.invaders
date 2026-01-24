//VALIDatION - inandyesandon andto for and yes

/**
 * inandyesand in yes for withNOTand score
 * @param {string} playerName - and player
 * @param {number} score - score player
 * @param {string} walletAddress - address toto
 * @returns {Object} {valid: boolean, errors: string[]}
 */
window.validateScoreSubmission = function(playerName, score, walletAddress) {
    const errors = [];

    //inandyesand andand player
    const nameValidation = window.validatePlayerName(playerName);
    if (!nameValidation.valid) {
        errors.push(nameValidation.error);
    }

    //inandyesand score
    if (typeof score !== 'number' || score < 0) {
        errors.push('Invalid score value');
    }

    if (score > 999999999) {
        errors.push('Score value is too large');
    }

    //inandyesand address toto
    if (!window.isValidAddress(walletAddress)) {
        errors.push('Invalid wallet address');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
};

/**
 * inandyesand andand on tournament
 * @param {string} walletAddress - address toto
 * @param {string} playerName - and player (Discord username)
 * @returns {Object} {valid: boolean, errors: string[]}
 */
window.validateTournamentRegistration = function(walletAddress, playerName) {
    const errors = [];

    //inandyesand address toto
    if (!window.isValidAddress(walletAddress)) {
        errors.push('Please connect your wallet');
    }

    //inandyesand Discord username (andonbut at andand, but at and)
    if (playerName) {
        const nameValidation = window.validatePlayerName(playerName);
        if (!nameValidation.valid) {
            errors.push(`Discord username: ${nameValidation.error}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
};

/**
 * inandyesand fee for game/tournament
 * @param {string|number} feeAmount - with fee
 * @param {string|number} requiredFee - fee
 * @returns {Object} {valid: boolean, error: string}
 */
window.validateFee = function(feeAmount, requiredFee) {
    if (!feeAmount || !requiredFee) {
        return { valid: false, error: 'Fee amount not specified' };
    }

    const fee = parseFloat(feeAmount);
    const required = parseFloat(requiredFee);

    if (isNaN(fee) || isNaN(required)) {
        return { valid: false, error: 'Invalid fee format' };
    }

    if (fee < required) {
        return { valid: false, error: `Insufficient fee. Required: ${required} PHRS` };
    }

    return { valid: true, error: null };
};

/**
 * inandyesand with toto
 * @param {string|number} balance - with toto (in Wei or Ether)
 * @param {string|number} requiredAmount -  with
 * @param {boolean} isWei - inwith and balance in Wei (by default true)
 * @returns {Object} {valid: boolean, error: string}
 */
window.validateBalance = function(balance, requiredAmount, isWei = true) {
    try {
        let balanceEther;

        if (isWei && window.Web3 && Web3.utils) {
            balanceEther = parseFloat(Web3.utils.fromWei(balance.toString(), 'ether'));
        } else {
            balanceEther = parseFloat(balance);
        }

        const required = parseFloat(requiredAmount);

        if (isNaN(balanceEther) || isNaN(required)) {
            return { valid: false, error: 'Invalid balance format' };
        }

        if (balanceEther < required) {
            return {
                valid: false,
                error: `Insufficient balance. You have ${balanceEther.toFixed(4)} PHRS, need ${required} PHRS`
            };
        }

        return { valid: true, error: null };

    } catch (error) {
        console.error('Balance validation error:', error);
        return { valid: false, error: 'Failed to validate balance' };
    }
};

/**
 * inandyesand transaction hash
 * @param {string} txHash - Hash toandand
 * @returns {boolean} true if hash inand
 */
window.isValidTransactionHash = function(txHash) {
    if (!txHash || typeof txHash !== 'string') return false;
    return /^0x[a-fA-F0-9]{64}$/.test(txHash);
};

/**
 * inandyesand network/chain ID
 * @param {string|number} chainId - Chain ID
 * @param {string|number} expectedChainId - andyes Chain ID
 * @returns {Object} {valid: boolean, error: string}
 */
window.validateChainId = function(chainId, expectedChainId) {
    const current = chainId.toString();
    const expected = expectedChainId.toString();

    if (current !== expected) {
        return {
            valid: false,
            error: `Wrong network. Please switch to Pharos Testnet (Chain ID: ${expected})`
        };
    }

    return { valid: true, error: null };
};

/**
 * inandyesand score for withNOTand in toto
 * @param {number} score - score player
 * @param {number} minScore - andand score for withNOTand (by default 0)
 * @returns {Object} {valid: boolean, error: string}
 */
window.validateScoreValue = function(score, minScore = 0) {
    if (typeof score !== 'number' || isNaN(score)) {
        return { valid: false, error: 'Invalid score value' };
    }

    if (score < minScore) {
        return { valid: false, error: `Score must be at least ${minScore}` };
    }

    if (score > 999999999) {
        return { valid: false, error: 'Score value is too large' };
    }

    if (!Number.isInteger(score)) {
        return { valid: false, error: 'Score must be an integer' };
    }

    return { valid: true, error: null };
};

/**
 * totowithon inandyesand forms game
 * @param {Object} formData - data forms
 * @param {string} formData.playerName - and player
 * @param {number} formData.score - score
 * @param {string} formData.walletAddress - address toto
 * @param {string|number} formData.balance - with toto
 * @param {string|number} formData.fee - Fee for game
 * @param {string|number} formData.chainId - Chain ID
 * @returns {Object} {valid: boolean, errors: string[]}
 */
window.validateGameForm = function(formData) {
    const errors = [];

    //inandyesand andand
    if (formData.playerName) {
        const nameValidation = window.validatePlayerName(formData.playerName);
        if (!nameValidation.valid) {
            errors.push(nameValidation.error);
        }
    } else {
        errors.push('Player name is required');
    }

    //inandyesand score
    if (formData.score !== undefined) {
        const scoreValidation = window.validateScoreValue(formData.score);
        if (!scoreValidation.valid) {
            errors.push(scoreValidation.error);
        }
    }

    //inandyesand address
    if (!window.isValidAddress(formData.walletAddress)) {
        errors.push('Invalid wallet address');
    }

    //inandyesand with (if to)
    if (formData.balance !== undefined && formData.fee !== undefined) {
        const balanceValidation = window.validateBalance(
            formData.balance,
            formData.fee,
            typeof formData.balance === 'string' && formData.balance.length > 10 //Wei if large number
        );
        if (!balanceValidation.valid) {
            errors.push(balanceValidation.error);
        }
    }

    //inandyesand chain ID (if to)
    if (formData.chainId && formData.expectedChainId) {
        const chainValidation = window.validateChainId(formData.chainId, formData.expectedChainId);
        if (!chainValidation.valid) {
            errors.push(chainValidation.error);
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
};

/**
 * Sanitize user input for toinand XSS
 * @param {string} input - inwithtoand inin
 * @returns {string} and towith
 */
window.sanitizeInput = function(input) {
    if (!input || typeof input !== 'string') return '';

    //Deleting HTML and
    let clean = input.replace(/<[^>]*>/g, '');

    //toand withand withandin
    clean = clean.replace(/[<>'"]/g, (char) => {
        const map = {
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        };
        return map[char];
    });

    return clean.trim();
};

/**
 * while andtoand inandyesandand in
 * @param {string[]} errors - array andto
 * @param {string} containerId - ID toNOT for fromand andto
 */
window.displayValidationErrors = function(errors, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Error container not found:', containerId);
        return;
    }

    if (!errors || errors.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }

    const errorHtml = errors.map(error =>
        `<div class="validation-error"> ${window.escapeHtml(error)}</div>`
    ).join('');

    container.innerHTML = errorHtml;
    container.style.display = 'block';
};
